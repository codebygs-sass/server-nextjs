import { NextResponse } from 'next/server';
import { admin, db } from '../../../lib/firebaseAdmin';

export async function POST(req) {
  try {
    const data = await req.json();
    const { email } = data;

    const user = await admin.auth().getUserByEmail(email);
    const userRef = db.collection('users').doc(user.uid);
    await userRef.set({ business: data }, { merge: true });

    return NextResponse.json({ message: "User found", uid: user.uid });
  } catch (error) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
}
