import { NextResponse } from 'next/server';
import {  admin, db } from '../../../../lib/firebaseAdmin';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('user');

    let doc;

    if (userId) {
      doc = await db.collection('profiles').doc(userId).get();

      if (!doc.exists) {
        return NextResponse.json({ message: 'User not found' }, { status: 404 });
      }

      return NextResponse.json({ id: doc.id, ...doc.data() });
    } else {
      const snapshot = await db
        .collection('users')
        .orderBy('uploadedAt', 'desc')
        .limit(1)
        .get();

      if (snapshot.empty) {
        return NextResponse.json({ message: 'No users found' }, { status: 404 });
      }

      const latest = snapshot.docs[0];
      return NextResponse.json({ id: latest.id, ...latest.data() });
    }
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}


  export async function POST(req) {
  try {
    const formData = await req.formData();

    const file = formData.get('file');
    const userId = formData.get('user');

    if (!file || typeof file === 'string') {
      return NextResponse.json({ message: 'No file uploaded' }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({ message: 'No userId provided' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Convert to base64
    const base64Image = `data:${file.type};base64,${buffer.toString('base64')}`;

    await db.collection('profiles').doc(userId).set(
      {
        profilePicture: base64Image,
        uploadedAt: new Date(),
      },
      { merge: true } // <- keeps existing data if any
    );

    return NextResponse.json({ message: 'Image saved to Firestore', id: userId });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: 'Error uploading image', error: error.message },
      { status: 500 }
    );
  }


  
}


export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('user');

    const userRef = db.collection('profiles').doc(userId);

    // Clear only the profilePicture field
    await userRef.update({
      profilePicture: admin.firestore.FieldValue.delete(),
    });

    return NextResponse.json({ message: 'Profile picture removed', id: userId });
  } catch (error) {
    console.error('Error removing picture:', error);
    return NextResponse.json(
      { message: 'Failed to remove profile picture', error: error.message },
      { status: 500 }
    );
  }
}
