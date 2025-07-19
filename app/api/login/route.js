import { NextResponse } from 'next/server';
import { admin, db } from '../../../lib/firebaseAdmin';



export async function POST(req) {
  try {
    const { idToken} = await req.json();
    const decodedToken = await admin.auth().verifyIdToken(idToken);



    return NextResponse.json({ message: "User found", data: decodedToken, token:idToken });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}