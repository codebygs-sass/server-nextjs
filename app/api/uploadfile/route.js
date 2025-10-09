import { NextResponse } from "next/server";
import { parseFile } from "music-metadata";
import { extractAudio } from "../../../lib/ffmpeg";
import fs from "fs";
import { promises as fsp } from "fs";
import path from "path";
import https from "https";
import { v4 as uuidv4 } from "uuid";

export const runtime = "nodejs"; // ✅ ensures Node environment

async function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    https.get(url, (response) => {
      response.pipe(file);
      file.on("finish", () => {
        file.close(() => resolve(destPath));
      });
    }).on("error", (err) => {
      fs.unlink(destPath, () => reject(err));
    });
  });
}

export async function POST(req) {
  try {
    const body = await req.json();
    const fileUrl = body.fileUrl;

    if (!fileUrl) {
      return NextResponse.json({ error: "No fileUrl provided" }, { status: 400 });
    }

    const tempDir = path.join(process.cwd(), "public", "uploads");
    await fsp.mkdir(tempDir, { recursive: true });

    const fileExt = path.extname(fileUrl.split("?")[0]);
    const tempFileName = `${uuidv4()}${fileExt}`;
    const tempPath = path.join(tempDir, tempFileName);

    await downloadFile(fileUrl, tempPath);

    const metadata = await parseFile(tempPath);
    const mimeType = metadata.format.mimeType;
    const isVideo = mimeType?.startsWith("video/");

    let finalPath = tempPath;

    if (isVideo) {
      const audioPath = path.join(tempDir, `${uuidv4()}.mp3`);
      await extractAudio(tempPath, audioPath);
      finalPath = audioPath;
    }

    const finalMeta = await parseFile(finalPath);
    const duration = finalMeta.format.duration?.toFixed(2);
    const minutes = Math.floor(duration / 60);
    const seconds = (duration % 60).toFixed(0);
    const formatted = `${minutes}m ${seconds}s`;

    return NextResponse.json({
      message: "Processed successfully",
      isVideo,
      duration: formatted,
      mimeType: finalMeta.format.mimeType,
      filePath: fileUrl,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "File upload or conversion failed" }, { status: 500 });
  }
}
