import {NextResponse} from 'next/server';
import {  db } from '../../../../lib/firebaseAdmin';

export async function GET(request)
{

       const url  =   new URL(request.url);

       const user = url.searchParams.get("user");
       const email = await db.collection("profile").doc(user).get();
        
    console.log("Email id : ", email)
    
    return NextResponse.json({response: email.data()});//email.data()
}


export async function POST(req)
{
    const {fullName, email, organization, timezone, user}  =  await req.json();
    
    db.collection("profile").doc(user).set({email: email, fullName: fullName, organization: organization, timezone: timezone})

    return NextResponse.json({request: user, response: "Data added successfully"});
}