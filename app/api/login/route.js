import { NextResponse } from 'next/server';
import { admin, db } from '../../../lib/firebaseAdmin';



export async function POST(req) {
  try {
    const { idToken} = await req.json();
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    
    const uid = decodedToken.uid;

    // 2. Get full user data (optional)
    const userRecord = await admin.auth().getUser(uid);


    return NextResponse.json({ message: "User found", data: decodedToken, token:idToken,name:userRecord.name,uid:uid,email:userRecord.email });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}