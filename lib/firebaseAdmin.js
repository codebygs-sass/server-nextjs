import admin from 'firebase-admin';
import serviceAccount from '../serviceAccountKey.json'
import { getFirestore } from "firebase-admin/firestore";

if (!admin.apps.length) {
  // const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://codebygs-4265d-default-rtdb.firebaseio.com/",
  });

  const db = admin.firestore();

  async function checkFirestoreConnection() {
    try {
      await db.collection("test").limit(1).get();
      console.log("✅ Firestore connected successfully");
    } catch (error) {
      console.error("❌ Firestore connection failed:", error.message);
    }
  }

  checkFirestoreConnection();
}


const db = admin.firestore();


export { admin, db };
