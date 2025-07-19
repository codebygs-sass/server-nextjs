// app/api/upload/route.js

import fs from "fs/promises";
import path from "path";
import { extractAudio } from "../../../lib/ffmpeg";

import { transcribeAudio } from "../../../lib/transcription";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return new Response(JSON.stringify({ error: "Invalid file upload" }), {
        status: 400,
      });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const uploadsDir = path.join(process.cwd(), "temp");
    await fs.mkdir(uploadsDir, { recursive: true });

    const videoPath = path.join(uploadsDir, `${Date.now()}_${file.name}`);
    const audioPath = path.join(uploadsDir, `${Date.now()}.wav`);

    // Save uploaded video file to disk
    await fs.writeFile(videoPath, buffer);

    // Process audio
    await extractAudio(videoPath, audioPath);
    const transcript = await transcribeAudio(audioPath);

    // Cleanup
    await fs.unlink(videoPath);
    await fs.unlink(audioPath);

    return new Response(JSON.stringify({ transcript }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Upload error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
