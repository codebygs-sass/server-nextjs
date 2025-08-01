import axios from 'axios';
import { NextResponse } from 'next/server';

const clientId = process.env.ZOOM_CLIENT_ID;
const clientSecret = process.env.ZOOM_CLIENT_SECRET;
const redirectUri = process.env.ZOOM_CLIENT_REDIRECT_URL;

export default async function POST(req, res) {
  const { code } = req.query;

  try {
    const tokenRes = await axios.post(
      'https://zoom.us/oauth/token',
      null,
      {
        params: {
          grant_type: 'authorization_code',
          code,
          redirect_uri: redirectUri,
        },
        headers: {
          Authorization:
            'Basic ' +
            Buffer.from(`${clientId}:${clientSecret}`).toString('base64'),
        },
      }
    );

    const { access_token, refresh_token, expires_in } = tokenRes.data;

    // Optional: Save tokens to your database/session
    console.log('[✅ Zoom Tokens]', { access_token, refresh_token });

    // Redirect or show success
     return NextResponse.redirect('/zoom/success'); // or send data
  } catch (err) {
    console.error('[❌ Zoom Token Exchange Error]', err);
     return NextResponse.status(500).send('Zoom token exchange failed');
  }
}
