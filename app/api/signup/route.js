import { NextResponse } from 'next/server';
import { admin, db } from '../../../lib/firebaseAdmin';

export async function POST(req) {
  try {
    const { email, password, name, phone, country } = await req.json();

    const userRecord = await admin.auth().createUser({
      email,
      password,
      phoneNumber: phone,
      displayName: name,
    });

    await db.collection("users").doc(userRecord.uid).set({
      uid: userRecord.uid,
      email,
      name,
    });

    return NextResponse.json({ message: "User created successfully", uid: userRecord.uid });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}