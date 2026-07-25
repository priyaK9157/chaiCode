import admin from "firebase-admin";

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY 
  ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') 
  : undefined;

let isFirebaseInitialized = false;

if (projectId && clientEmail && privateKey) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
    isFirebaseInitialized = true;
    console.log("🔥 [Firebase] Admin SDK initialized successfully");
  } catch (err) {
    console.error("❌ [Firebase] Failed to initialize Admin SDK:", err.message);
  }
} else {
  console.log("⚠️ [Firebase] Credentials missing. Running in MOCK/DEVELOPMENT mode.");
  console.log("💡 [Firebase] To enable live push notifications, set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY in your environment variables.");
}

export { admin, isFirebaseInitialized };
