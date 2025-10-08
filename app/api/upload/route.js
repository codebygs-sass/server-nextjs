import fs from "fs";
import fsPromises from "fs/promises";
import path from "path";
import https from "https";
import { v4 as uuidv4 } from "uuid";

import { extractAudio } from "../../../lib/ffmpeg";
import { transcribeAudio } from "../../../lib/transcription";
import { parseFile } from "music-metadata";

export async function POST(request) {
  try {
    const { fileUrl } = await request.json();

    if (!fileUrl) {
      return new Response(JSON.stringify({ error: "No file URL provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Create temp directory
    const tempDir = path.join(process.cwd(), "temp");
    await fsPromises.mkdir(tempDir, { recursive: true });

    // Extract file extension from URL
    const fileExt = path.extname(fileUrl.split("?")[0]) || ".mp4";
    const tempFileName = `${uuidv4()}${fileExt}`;
    const tempFilePath = path.join(tempDir, tempFileName);

    // Download the file
    await downloadFile(fileUrl, tempFilePath);

    // Check MIME type to determine if it's a video
    const metadata = await parseFile(tempFilePath);
    const isVideo = metadata.format.mimeType?.startsWith("video/");

    let audioPath = tempFilePath;

    if (isVideo) {
      // Convert to audio (MP3)
      const audioFileName = `${uuidv4()}.mp3`;
      audioPath = path.join(tempDir, audioFileName);
      await extractAudio(tempFilePath, audioPath);
    }

    // Transcribe
    const transcript = await transcribeAudio(audioPath);

    // Optional cleanup
    // await fsPromises.unlink(tempFilePath);
    // if (isVideo) await fsPromises.unlink(audioPath);

    return new Response(JSON.stringify({ transcript }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Upload error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// Helper: Download file from URL
function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        return reject(new Error(`Failed to download file: ${response.statusCode}`));
      }
      response.pipe(file);
      file.on("finish", () => {
        file.close(resolve);
      });
    }).on("error", (err) => {
      fs.unlink(destPath, () => reject(err));
    });
  });
}
