import admin from "firebase-admin";
import type { Auth } from "firebase-admin/auth";

if (!admin.apps.length) {
  try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log("[Firebase] Admin initialized via Service Account JSON.");
    } else {
      console.warn("[Firebase] Warning: FIREBASE_SERVICE_ACCOUNT not found in ENV. Auth will fail.");
    }
  } catch (error) {
    console.error("[Firebase] Error initializing admin sdk:", error);
  }
}

export const auth: Auth | null = admin.apps.length ? admin.auth() : null;
