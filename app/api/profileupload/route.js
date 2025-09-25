import { NextResponse } from 'next/server';
import { admin, db } from '../../../lib/firebaseAdmin';
import path from 'path';
import { writeFile } from 'fs/promises';

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const userId = formData.get("userId");
    const token = formData.get("token"); // ID token from client

    if (!file || !token) {
      return NextResponse.json({ error: "Missing file or token" }, { status: 400 });
    }

    // Verify the Firebase ID token
    // let decodedToken;
    // try {
    //   decodedToken = await admin.auth().verifyIdToken(token);
    // } catch (err) {
    //   if (err.code === 'auth/id-token-expired') {
    //     return NextResponse.json({ error: "ID token expired. Please refresh your token on client." }, { status: 401 });
    //   }
    //   throw err;
    // }

    // const uid = decodedToken.uid;

    // Save file locally
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = path.join(process.cwd(), 'public', 'uploads', fileName);

    await writeFile(filePath, buffer);

    // File accessible at: /uploads/<filename>
    const photoURL = `/uploads/${fileName}`;

    // Update Firestore user document
    // await db.collection("users").doc(userId).set({ photoURL }, { merge: true });

    // // Optionally, update Firebase Auth photoURL
    // await admin.auth().updateUser(uid, { photoURL });

    return NextResponse.json({ success: true, photoURL });
  } catch (err) {
    console.error("Error uploading file:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
