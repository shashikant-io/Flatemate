# FlatMate 🏠💰
**Shared Expense Manager for Shashikant & Nitesh**

FlatMate is a production-ready, mobile-first web app (PWA) designed to replace the physical notebook used to track shared household purchases (atta, rice, oil, milk, vegetables, electricity, cleaning products). It records every purchase, syncs both phones in real-time, and calculates exact net balances with zero paisa lost.

The core flow is minimal and fast: **Open app $\rightarrow$ Add item $\rightarrow$ Enter amount $\rightarrow$ Pick who paid $\rightarrow$ Save.**

---

## 1. Tech Stack & Monorepo Architecture

```
flatmate/
├── apps/
│   └── web/                # React 18, TypeScript, Vite, Tailwind CSS, PWA, Lucide React
├── functions/              # Cloud Functions (2nd Gen, TypeScript, region asia-south1)
├── packages/
│   └── shared/             # Pure calculation engine, types, currency, validation, tests
├── firebase.json           # Firebase configuration (Firestore, Storage, Functions, Hosting)
├── firestore.rules         # Claim-based Firestore security rules
├── firestore.indexes.json  # Composite index definitions for monthly queries
└── storage.rules           # Private Storage security rules (images <= 2MB)
```

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS with design tokens, installable PWA (`vite-plugin-pwa`).
- **Backend**: Firebase Anonymous Auth, Cloud Firestore with multi-tab offline persistence, Cloud Storage for Firebase, Cloud Functions (TypeScript, `asia-south1`).
- **Shared Engine**: Pure, deterministic integer paise calculation engine with unit tests (Vitest).

---

## 2. Access Model & Security Disclosure

### No Login or Password Screens
1. On first open, the app silently authenticates via **Firebase Anonymous Auth**.
2. A single screen asks: **"Who are you?"** (Shashikant or Nitesh) and prompts for the **flat passcode**. This happens once per device.
3. The callable Cloud Function `joinFlat({ passcode, member })` verifies the passcode against a SHA-256 hash stored as a Firebase secret or environment variable (`FLAT_PASSCODE_HASH`) using **constant-time equality** (`crypto.timingSafeEqual`) to prevent timing attacks.
4. **Brute-Force Protection**: Enforces a strict limit of **at most 5 wrong attempts per 15 minutes** per user UID and per IP address tracked in Firestore.
5. On success, custom claims `{ flatId: "flat_204", member: "shashikant" | "nitesh" }` are stamped on the Firebase user token, which the client immediately refreshes.
6. All Firestore and Storage rules require these claims. Without valid claims, no database or storage path can be read or written.

> [!WARNING]
> **Security Notice**: Because FlatMate uses anonymous auth linked via the flat passcode, **the flat passcode is the sole gatekeeper protecting your shared flat data**. Choose a strong, long, random passcode (e.g. 12+ characters) and never share it outside your household.

---

## 3. Pure Calculation Engine (`@flatmate/shared`)

All money is handled strictly in **integer paise** (₹1 = 100 paise) to eliminate IEEE-754 floating-point rounding errors.

- **Shared Filter**: Evaluates only `type === 'shared'`, non-deleted expenses whose purchase date falls in the target billing cycle (`YYYY-MM`). Duplicate IDs are skipped.
- **Odd-Paise Rotation**: Splits total paise equally (`floor(total / n)`). Leftover remainder paise (`total % n`) are distributed one-by-one in a rotating order that increments by month (`(year * 12 + month) % n`), ensuring shares always sum exactly to the total with no paisa lost or invented.
- **Settlements**: Only `completed`, non-deleted settlements tagged to the target month alter the net balance. Pending payments change nothing.
- **Debt Minimization**: Employs a greedy transfer algorithm to clear all debts in the minimal number of peer-to-peer payments.
- **Perspective Messages**: Generates viewer-centric messages:
  - *"You owe Nitesh ₹250.00"*
  - *"Nitesh owes you ₹250.00"*
  - *"All settled up!"*

---

## 4. Key Features & Screens

### 📱 Home (Dashboard)
- **Hero Balance Card**: Visual contribution progress bar showing the live split between Shashikant and Nitesh with net status.
- **Quick Actions**: One-tap access to **Add Expense** and **Settle Up**.
- **Metrics**: Total shared spend and equal share per flatmate.
- **Category Breakdown**: Spending visualizer for Groceries, Dairy, Vegetables, Utilities, Cleaning, and Other.
- **Recent Transactions Feed**: Live list of the latest purchases with payer indicators and category icons.

### ➕ Add Expense
- **Huge numeric keypad field** for rapid input.
- Quick suggestion chips (+ Atta, + Milk & Curd, + Cooking Oil, + Veggies, etc.).
- Segmented payer picker defaulting to the active viewer.
- Split mode toggle (Shared vs Personal).
- Client-side browser image compression (max 1280px, ~80% quality, < 250KB) before uploading to Cloud Storage.

### 📜 History
- Live search by purchase item and notes.
- Multi-dimensional filters: by flatmate (Everyone / Shashikant / Nitesh), by category, and by split type.
- Soft delete with confirmation dialog.
- Inline edit drawer.
- **"Pending sync"** badge for items saved while offline.
- Read-only locked mode for closed months.

### 🤝 Settle Up
- Auto-fill button pre-populating the exact debt to square up balances.
- Payer/receiver selectors, payment method notes, and date.
- Status toggle: **Completed** (immediately adjusts balances) vs **Pending** (requires recipient confirmation).

### 📊 Monthly Reports
- Month and year picker.
- Head-to-head comparison graph between Shashikant and Nitesh.
- Most purchased household items ranking.
- **Download CSV**: Includes spreadsheet formula injection protection (neutralizing cells starting with `=`, `+`, `-`, `@`).
- **Print / PDF Export**: Clean printable document supporting Indian Rupee notation.
- **Close Month**: Invokes the `closeMonth` Cloud Function to compute and freeze an immutable statement snapshot.

### 👤 Profile
- Active flatmate identity display.
- **Switch Member**: Re-enter the passcode to switch identities.
- **Theme Switcher**: Light mode, Dark mode, and System preference.
- **Forget This Device**: Securely unpairs the device and returns to onboarding.

---

## 5. Environment Configuration

Frontend environment variables are defined in `apps/web/.env` (git-ignored) with a committed `apps/web/.env.example`:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
VITE_FIREBASE_FUNCTIONS_REGION=asia-south1
```

Validation in `apps/web/src/lib/firebase.ts` verifies all required variables and throws a clear error if any are missing.

---

## 6. How to Run Locally

### Install Dependencies
```powershell
npm install
```

### Run All Unit & Security Tests
```powershell
npm run test --workspace=@flatmate/shared
```
*Executes all 19 unit tests (calculation engine, odd paise rotation, debt clearing, decimal parsing, CSV formula neutralization, and Firestore/Storage rule policies).*

### Build Packages
```powershell
# Build shared package
npm run build --workspace=@flatmate/shared

# Build Cloud Functions
npm run build --workspace=functions

# Build Web App (Vite + PWA)
npm run build --workspace=apps/web
```

### Start Web Development Server
```powershell
npm run dev --workspace=apps/web
```
Open [http://localhost:3000](http://localhost:3000) on your phone or browser.

---

## 7. Firebase Deployment Guide

### Prerequisites
1. Install Firebase CLI:
   ```powershell
   npm install -g firebase-tools
   ```
2. Log in:
   ```powershell
   firebase login
   ```
3. Initialize / select your project:
   ```powershell
   firebase use --add <your-firebase-project-id>
   ```

### Set the Secret Passcode Hash
Generate a SHA-256 hash of your chosen flat passcode:
```powershell
node -e "console.log(require('crypto').createHash('sha256').update('your_secret_passcode_here').digest('hex'))"
```
Set it in Firebase Functions Secrets:
```powershell
firebase functions:secrets:set FLAT_PASSCODE_HASH
# Paste the resulting SHA-256 hex string when prompted
```

### Cloud Functions Blaze Plan & Cost
> [!NOTE]
> Cloud Functions (2nd Gen) requires the Firebase **Blaze (Pay as you go)** plan.
> 
> **Estimated monthly cost for two flatmates: $0.00 (Free)**.
> Firebase includes a generous monthly free tier:
> - 2,000,000 Cloud Function invocations/month (two flatmates use ~100/month).
> - 50,000 Firestore reads / 20,000 writes per day.
> - 5 GB Storage and 10 GB/month Hosting bandwidth.
> You will stay well within the free tier. Set a budget alert of $1.00 in the Google Cloud Console for peace of mind.

### Deploy Rules, Functions, and Hosting
```powershell
# 1. Deploy Firestore and Storage security rules + composite indexes
firebase deploy --only firestore,storage

# 2. Deploy Cloud Functions
firebase deploy --only functions

# 3. Build and deploy Web PWA to Firebase Hosting
npm run build --workspace=apps/web
firebase deploy --only hosting
```

---

## 8. Installing as a PWA on Phones

- **Android (Chrome)**: Tap the browser menu `⋮` $\rightarrow$ **"Add to Home screen"** or **"Install app"**.
- **iOS (Safari)**: Tap the Share button $\rightarrow$ **"Add to Home Screen"**.
- Once installed, FlatMate runs full-screen like a native app, works with safe-area insets on notched phones, supports offline viewing, and caches app assets locally.

