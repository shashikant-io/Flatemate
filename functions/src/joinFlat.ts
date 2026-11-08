import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import * as crypto from 'crypto';

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILED_ATTEMPTS = 5;

interface AuthData {
  flatId: string;
  password: string;
  name: string;
}

function normaliseName(name: string): string {
  return name.trim().replace(/\s+/g, ' ');
}

function validateInput(data: Partial<AuthData>) {
  const flatId = data.flatId?.trim().toLowerCase();
  const password = data.password?.trim();
  const name = data.name ? normaliseName(data.name) : '';
  if (!flatId || !/^[a-z0-9][a-z0-9_-]{2,40}$/.test(flatId)) {
    throw new HttpsError('invalid-argument', 'Enter a valid Flat ID.');
  }
  if (!password || password.length < 8 || password.length > 128) {
    throw new HttpsError('invalid-argument', 'Flat password must be 8 to 128 characters.');
  }
  if (!name || name.length < 2 || name.length > 60) {
    throw new HttpsError('invalid-argument', 'Your name must be 2 to 60 characters.');
  }
  return { flatId, password, name };
}

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(password, salt, 64);
  return `scrypt$${salt.toString('hex')}$${hash.toString('hex')}`;
}

function verifyPassword(password: string, encoded: string): boolean {
  const [, saltHex, hashHex] = encoded.split('$');
  if (!saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, 'hex');
  const actual = crypto.scryptSync(password, Buffer.from(saltHex, 'hex'), expected.length);
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
}

function newMemberId(): string {
  return `member_${crypto.randomUUID().replace(/-/g, '').slice(0, 20)}`;
}

async function checkRateLimit(db: admin.firestore.Firestore, key: string, now: number) {
  const ref = db.collection('rateLimits').doc(key);
  const snapshot = await ref.get();
  const attempts = snapshot.exists
    ? ((snapshot.data()?.attempts || []) as number[]).filter(
        (timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS
      )
    : [];
  if (attempts.length >= MAX_FAILED_ATTEMPTS) {
    const waitMinutes = Math.ceil(
      (Math.min(...attempts) + RATE_LIMIT_WINDOW_MS - now) / 60000
    );
    throw new HttpsError(
      'resource-exhausted',
      `Too many failed attempts. Please wait ${waitMinutes} minute${waitMinutes === 1 ? '' : 's'}.`
    );
  }
}

async function recordFailedAttempt(db: admin.firestore.Firestore, key: string, now: number) {
  const ref = db.collection('rateLimits').doc(key);
  const snapshot = await ref.get();
  const attempts = snapshot.exists ? ((snapshot.data()?.attempts || []) as number[]) : [];
  await ref.set({
    attempts: [...attempts.filter((timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS), now],
    lastAttemptAt: now,
  });
}

async function clearRateLimit(db: admin.firestore.Firestore, key: string) {
  await db.collection('rateLimits').doc(key).delete();
}

async function setMemberClaims(uid: string, flatId: string, memberId: string) {
  await admin.auth().setCustomUserClaims(uid, { flatId, member: memberId });
}

export const createFlat = onCall({ region: 'asia-south1' }, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Sign in before creating a flat.');
  }
  const { password, name } = validateInput({
    flatId: `flat_${crypto.randomBytes(5).toString('hex')}`,
    password: request.data?.password,
    name: request.data?.name,
  });
  const flatId = `flat_${crypto.randomBytes(5).toString('hex')}`;
  const memberId = newMemberId();
  const db = admin.firestore();
  const batch = db.batch();
  batch.set(db.doc(`flats/${flatId}`), {
    name: `${name}'s Flat`,
    createdAt: new Date().toISOString(),
    ownerId: memberId,
  });
  batch.set(db.doc(`flats/${flatId}/private/config`), {
    passwordHash: hashPassword(password),
    createdAt: new Date().toISOString(),
  });
  batch.set(db.doc(`flats/${flatId}/members/${memberId}`), {
    name,
    normalizedName: name.toLowerCase(),
    joinedAt: new Date().toISOString(),
  });
  await batch.commit();
  await setMemberClaims(request.auth.uid, flatId, memberId);
  return { success: true, flatId, memberId, memberName: name, flatName: `${name}'s Flat` };
});

export const joinFlat = onCall({ region: 'asia-south1' }, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Sign in before joining a flat.');
  }
  const { flatId, password, name } = validateInput(request.data || {});
  const db = admin.firestore();
  const now = Date.now();
  const userLimitKey = `user_${request.auth.uid}`;
  const ip = String(
    request.rawRequest?.headers['x-forwarded-for'] ||
      request.rawRequest?.socket?.remoteAddress ||
      'unknown'
  )
    .split(',')[0]
    .trim()
    .replace(/[:.]/g, '_');
  const ipLimitKey = `ip_${ip}`;
  await checkRateLimit(db, userLimitKey, now);
  await checkRateLimit(db, ipLimitKey, now);

  const flatRef = db.doc(`flats/${flatId}`);
  const secretRef = db.doc(`flats/${flatId}/private/config`);
  const [flatSnapshot, secretSnapshot] = await Promise.all([flatRef.get(), secretRef.get()]);
  const passwordHash = secretSnapshot.data()?.passwordHash as string | undefined;
  if (!flatSnapshot.exists || !passwordHash || !verifyPassword(password, passwordHash)) {
    await recordFailedAttempt(db, userLimitKey, now);
    await recordFailedAttempt(db, ipLimitKey, now);
    throw new HttpsError('permission-denied', 'Incorrect Flat ID or password.');
  }
  await clearRateLimit(db, userLimitKey);
  await clearRateLimit(db, ipLimitKey);

  const membersRef = flatRef.collection('members');
  const existing = await membersRef.where('normalizedName', '==', name.toLowerCase()).limit(1).get();
  const memberRef = existing.empty ? membersRef.doc(newMemberId()) : existing.docs[0].ref;
  if (existing.empty) {
    await memberRef.set({
      name,
      normalizedName: name.toLowerCase(),
      joinedAt: new Date().toISOString(),
    });
  }
  const member = (await memberRef.get()).data() || { name };
  await setMemberClaims(request.auth.uid, flatId, memberRef.id);
  return {
    success: true,
    flatId,
    memberId: memberRef.id,
    memberName: member.name,
    flatName: flatSnapshot.data()?.name || 'Shared Flat',
  };
});

export const updateMemberName = onCall({ region: 'asia-south1' }, async (request) => {
  if (!request.auth?.token.flatId || !request.auth.token.member) {
    throw new HttpsError('permission-denied', 'You are not a member of a flat.');
  }
  const name = normaliseName(request.data?.name || '');
  if (name.length < 2 || name.length > 60) {
    throw new HttpsError('invalid-argument', 'Your name must be 2 to 60 characters.');
  }
  const memberRef = admin
    .firestore()
    .doc(`flats/${request.auth.token.flatId}/members/${request.auth.token.member}`);
  await memberRef.update({ name, normalizedName: name.toLowerCase(), updatedAt: new Date().toISOString() });
  return { success: true, memberName: name };
});
