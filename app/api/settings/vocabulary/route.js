import {NextResponse} from 'next/server';
import {  db } from '../../../../lib/firebaseAdmin';

export async function GET(request)
{

       const url  =   new URL(request.url);

       const user = url.searchParams.get("user");
       const email = await db.collection("vocabulary").doc(user).get();
        
    console.log("Email id : ", email)
    
    return NextResponse.json({response: email.data()});
}


export async function POST(req)
{
    const {vocabulary, user}  =  await req.json();
    
    db.collection("vocabulary").doc(user).set({vocabulary: vocabulary})

    return NextResponse.json({request: user, response: "Data added successfully"});
}