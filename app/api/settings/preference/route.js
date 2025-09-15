import {NextResponse} from 'next/server';
import {  db } from '../../../../lib/firebaseAdmin';

export async function GET(request)
{

       const url  =   new URL(request.url);

       const user = url.searchParams.get("user");
       const email = await db.collection("preference").doc(user).get();
        
    console.log("Email id : ", email)
    
    return NextResponse.json({response: email.data()});
}


export async function POST(req)
{
    const {langauge, punctuation, diarization, timestamps, Theme, playback, recording , summary, format, user}  =  await req.json();
    
    db.collection("preference").doc(user).set({langauge: langauge, punctuation: punctuation, diarization: diarization, timestamps: timestamps, Theme: Theme, playback: playback, recording: recording , summary: summary, format: format})

    return NextResponse.json({request: user, response: "Data added successfully"});
}