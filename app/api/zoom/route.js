import fs from "fs";
import fsPromises from "fs/promises";
import path from "path";
import https from "https";
import { v4 as uuidv4 } from "uuid";
import { parseFile } from "music-metadata";
import { extractAudio } from "../../../lib/ffmpeg";        // your helper
import { transcribeAudio } from "../../../lib/transcription.mjs"; // your helper

// Allow CORS if you call this from another origin (like localhost:3000 → vercel.app)
export const runtime = "nodejs"; // ensures Node APIs available

export async function POST(request) {
  try {
    const { fileUrl } = await request.json();

    if (!fileUrl) {
      return new Response(JSON.stringify({ error: "No file URL provided" }), {
        status: 400,
        headers: corsHeaders(),
      });
    }

    // Create temp directory
    const tempDir = path.join(process.cwd(), "temp");
    await fsPromises.mkdir(tempDir, { recursive: true });

    // Generate local file path
    const fileExt = path.extname(fileUrl.split("?")[0]) || ".mp4";
    const tempFilePath = path.join(tempDir, `${uuidv4()}${fileExt}`);

    // 1️⃣ Download from Firebase Storage
    await downloadFile(fileUrl, tempFilePath);

    // 2️⃣ Detect if file is video or audio
    const metadata = await parseFile(tempFilePath);
    const isVideo = metadata.format.mimeType?.startsWith("video/");

    // 3️⃣ Extract audio if video
    let audioPath = tempFilePath;
    if (isVideo) {
      audioPath = path.join(tempDir, `${uuidv4()}.mp3`);
      await extractAudio(tempFilePath, audioPath);
    }

    // 4️⃣ Transcribe audio
    const transcript = await transcribeAudio(audioPath);

    // 5️⃣ Clean up (optional)
    try {
      await fsPromises.unlink(tempFilePath);
      if (isVideo) await fsPromises.unlink(audioPath);
    } catch (e) {
      console.warn("Cleanup failed:", e);
    }

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

// Helper to download file from a Firebase Storage URL
function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    https
      .get(url, (response) => {
        if (response.statusCode !== 200) {
          return reject(new Error(`Download failed: ${response.statusCode}`));
        }
        response.pipe(file);
        file.on("finish", () => file.close(resolve));
      })
      .on("error", (err) => {
        fs.unlink(destPath, () => reject(err));
      });
  });
}

// Simple CORS header helper
function corsHeaders() {
  return {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}

// Handle preflight CORS
export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}
