import admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(
      JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
    ),
  });
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { token } = body;

    if (!token) {
      return new Response(JSON.stringify({ error: "Token missing" }), { status: 400 });
    }

    // Verify the token
    const decoded = await admin.auth().verifyIdToken(token);

    return new Response(JSON.stringify({
      uid: decoded.uid,
      email: decoded.email,
      name: decoded.name || null,
      picture: decoded.picture || null,
    }), { status: 200 });

  } catch (error) {
    console.error("Token verification failed:", error);
    return new Response(JSON.stringify({ error: "Invalid token" }), { status: 401 });
  }
}
