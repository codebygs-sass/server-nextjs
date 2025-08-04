import { KJUR } from 'jsrsasign';
import { NextResponse } from 'next/server';

export async function POST(req) {

 try {
    const body = await req.json();
    const { meetingNumber, role = 0, expirationSeconds = 7200 } = body;

    // if (!meetingNumber || !role) {
    //   return NextResponse.json({ error: 'meetingNumber and role are required',json:body }, { status: 400 });
    // }

    const iat = Math.floor(Date.now() / 1000);
    const exp = iat + expirationSeconds;

    const oHeader = { alg: 'HS256', typ: 'JWT' };
    const oPayload = {
      appKey: process.env.ZOOM_CLIENT_ID,
      sdkKey: process.env.ZOOM_CLIENT_ID,
      mn: meetingNumber,
      role,
      iat,
      exp,
      tokenExp: exp,
    };

    const sHeader = JSON.stringify(oHeader);
    const sPayload = JSON.stringify(oPayload);
    const signature = KJUR.jws.JWS.sign('HS256', sHeader, sPayload, process.env.ZOOM_CLIENT_SECRET);

    return NextResponse.json({
      signature,
      sdkKey: process.env.ZOOM_CLIENT_ID,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
