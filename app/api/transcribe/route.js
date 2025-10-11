// app/api/transcribe/route.js
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { extractAudio } from "../../../lib/ffmpeg";
import { transcribeAudio } from "../../../lib/transcription.js";
import { parseFile } from "music-metadata";

// ✅ Allow preflight & CORS
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export async function POST(request) {
  try {
    const { fileId } = await request.json();

    if (!fileId) {
      return new Response(JSON.stringify({ error: "No fileId provided" }), {
        status: 400,
        headers: corsHeaders(),
      });
    }

    const tempDir = path.join(process.cwd(), "temp");
    const tempFilePath = path.join(tempDir, fileId);

    if (!fs.existsSync(tempFilePath)) {
      return new Response(JSON.stringify({ error: "File not found" }), {
        status: 404,
        headers: corsHeaders(),
      });
    }

    const metadata = await parseFile(tempFilePath);
    const isVideo = metadata.format.mimeType?.startsWith("video/");

    let audioPath = tempFilePath;
    if (isVideo) {
      const audioFileName = `${uuidv4()}.mp3`;
      audioPath = path.join(tempDir, audioFileName);
      await extractAudio(tempFilePath, audioPath);
    }

    const transcript = await transcribeAudio(audioPath);

    return new Response(JSON.stringify({ transcript }), {
      status: 200,
      headers: corsHeaders(),
    });
  } catch (error) {
    console.error("Transcription error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: corsHeaders(),
    });
  }
}

// ✅ Helper to reuse CORS headers
function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*", // or specify your frontend domain
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Content-Type": "application/json",
  };
}
