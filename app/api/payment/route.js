// app/api/payment/route.js
import { NextResponse } from "next/server";
import { admin, db } from '../../../lib/firebaseAdmin';



export async function POST(req) {
  try {
    const body = await req.json();
    const { token, paymentId, paymentPlan } = body;

    if (!token || !paymentId || !paymentPlan) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Verify Firebase token
    const decodedToken = await admin.auth().verifyIdToken(token);
    const uid = decodedToken.uid;

    // Save payment details in Firestore
    // const db = admin.firestore();
    const createdDate = new Date().toISOString();

    await db.collection("users").doc(uid).set(
      {
        paymentId,
        paymentPlan,
        createdDate,
      },
      { merge: true }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in payment API:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
