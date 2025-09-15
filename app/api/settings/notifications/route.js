import {NextResponse} from 'next/server';
import {  db } from '../../../../lib/firebaseAdmin';

export async function GET(request)
{

       const url  =   new URL(request.url);

       const user = url.searchParams.get("user");
       const email = await db.collection("notifications").doc(user).get();
        
    console.log("Email id : ", email)
    
    return NextResponse.json({response: email.data()});
}


export async function POST(req)
{
    const {recording , transcript , mentions, shared , email, push , desktop , summary,  user}  =  await req.json();
    
    db.collection("notifications")
    .doc(user)
    .set({recording: recording,
                transcript: transcript,
                mentions: mentions,
                shared: shared,
                email: email,
                push: push,
                desktop: desktop,
                summary: summary});

    return NextResponse.json({request: user, response: "Data added successfully"});
}