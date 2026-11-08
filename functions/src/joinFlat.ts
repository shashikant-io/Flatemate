import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import * as crypto from 'crypto';

const FLAT_ID = 'flat_204';
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_FAILED_ATTEMPTS = 5;

// Default hash of "flatmate2026" if FLAT_PASSCODE_HASH is not set in secrets / env
const DEFAULT_PASSCODE_HASH = crypto
  .createHash('sha256')
  .update('flatmate2026')
  .digest('hex');

interface JoinFlatData {
  passcode: string;
  member: string; // 'shashikant' | 'nitesh'
}

/**
 * Checks and records rate limiting for failed passcode entries.
 * Enforces a strict max of 5 failed attempts per 15-minute sliding window per user and IP.
 */
async function checkRateLimit(db: admin.firestore.Firestore, key: string, now: number) {
  const ref = db.collection('rateLimits').doc(key);
  const doc = await ref.get();

  if (doc.exists) {
    const data = doc.data() || {};
    const attempts: number[] = (data.attempts || []).filter(
      (ts: number) => now - ts < RATE_LIMIT_WINDOW_MS
    );

    if (attempts.length >= MAX_FAILED_ATTEMPTS) {
      const oldestAttempt = Math.min(...attempts);
      const waitMinutes = Math.ceil((oldestAttempt + RATE_LIMIT_WINDOW_MS - now) / 60000);
      throw new HttpsError(
        'resource-exhausted',
        `Too many failed attempts. Please wait ${waitMinutes} minute${
          waitMinutes === 1 ? '' : 's'
        } before trying again.`
      );
    }
  }
}

async function recordFailedAttempt(db: admin.firestore.Firestore, key: string, now: number) {
  const ref = db.collection('rateLimits').doc(key);
  const doc = await ref.get();
  const existingAttempts: number[] = doc.exists ? doc.data()?.attempts || [] : [];
  const validAttempts = existingAttempts.filter(
    (ts: number) => now - ts < RATE_LIMIT_WINDOW_MS
  );
  validAttempts.push(now);

  await ref.set({ attempts: validAttempts, lastAttemptAt: now }, { merge: true });
}

async function clearRateLimit(db: admin.firestore.Firestore, key: string) {
  await db.collection('rateLimits').doc(key).delete().catch(() => {});
}

export const joinFlat = onCall(
  {
    region: 'asia-south1',
  },
  async (request) => {
    // 1. Must be authenticated with anonymous auth
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'User must be signed in anonymously first.');
    }

    const { passcode, member } = request.data as JoinFlatData;
    const uid = request.auth.uid;
    const rawIp =
      request.rawRequest?.headers['x-forwarded-for'] ||
      request.rawRequest?.socket?.remoteAddress ||
      'unknown_ip';
    const ipStr = String(rawIp).split(',')[0].trim().replace(/[:.]/g, '_');

    if (!passcode || typeof passcode !== 'string') {
      throw new HttpsError('invalid-argument', 'Flat passcode is required.');
    }

    if (!member || typeof member !== 'string') {
      throw new HttpsError('invalid-argument', 'Member selection is required.');
    }

    const db = admin.firestore();
    const now = Date.now();
    const userLimitKey = `user_${uid}`;
    const ipLimitKey = `ip_${ipStr}`;

    // 2. Check rate limits for brute-force protection
    await checkRateLimit(db, userLimitKey, now);
    await checkRateLimit(db, ipLimitKey, now);

    // 3. Constant-time passcode verification
    const storedHashHex = process.env.FLAT_PASSCODE_HASH || DEFAULT_PASSCODE_HASH;
    const inputHashHex = crypto
      .createHash('sha256')
      .update(passcode.trim())
      .digest('hex');

    const inputBuf = Buffer.from(inputHashHex, 'hex');
    const storedBuf = Buffer.from(storedHashHex, 'hex');

    const isValidPasscode =
      inputBuf.length === storedBuf.length &&
      crypto.timingSafeEqual(inputBuf, storedBuf);

    if (!isValidPasscode) {
      // Record failed attempts against user and IP
      await recordFailedAttempt(db, userLimitKey, now);
      await recordFailedAttempt(db, ipLimitKey, now);

      throw new HttpsError('permission-denied', 'Incorrect flat passcode.');
    }

    // 4. Clear rate limits on success
    await clearRateLimit(db, userLimitKey);
    await clearRateLimit(db, ipLimitKey);

    // 5. Ensure flat document exists in Firestore
    const flatRef = db.doc(`flats/${FLAT_ID}`);
    const flatSnap = await flatRef.get();
    if (!flatSnap.exists) {
      await flatRef.set({
        name: 'Flat 204',
        members: [
          { id: 'shashikant', name: 'Shashikant' },
          { id: 'nitesh', name: 'Nitesh' },
        ],
        createdAt: new Date().toISOString(),
      });
    }

    // 6. Set custom claims on user token: { flatId, member }
    await admin.auth().setCustomUserClaims(uid, {
      flatId: FLAT_ID,
      member: member.toLowerCase(),
    });

    return {
      success: true,
      flatId: FLAT_ID,
      member: member.toLowerCase(),
    };
  }
);

