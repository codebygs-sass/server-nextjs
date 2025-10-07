import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import fs from "fs";
import { parseFile } from "music-metadata";
import { extractAudio } from "../../../lib/ffmpeg"; // ✅ import your function

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("files");

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

   

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileName = `${Date.now()}-${file.name}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads");

    await fs.promises.mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, fileName);
    await writeFile(filePath, buffer);

    // Get metadata
    const metadata = await parseFile(filePath);
    const mimeType = metadata.format.mimeType || file.type;
    const isVideo = mimeType?.startsWith("video/");

    let audioPath = filePath;
    let audioFileName = fileName;

    if (isVideo) {
      audioFileName = `${Date.now()}-${path.parse(file.name).name}.mp3`;
      audioPath = path.join(uploadDir, audioFileName);

      // ✅ Call your helper function
      await extractAudio(filePath, audioPath);
    }

    // Get audio metadata
    const audioMeta = await parseFile(audioPath);
    const duration = audioMeta.format.duration?.toFixed(2);
    const minutes = Math.floor(duration / 60);
    const seconds = (duration % 60).toFixed(0);
    const formatted = `${minutes}m ${seconds}s`;

    return NextResponse.json({
      message: "Processed successfully",
      name: file.name,
      isVideo,
      converted: isVideo ? "Video converted to audio" : "Audio uploaded directly",
      fileName: audioFileName,
      duration: formatted,
      mimeType: file.type,
      filePath: `/uploads/${audioFileName}`,
      size: fs.statSync(audioPath).size,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "File upload or conversion failed" }, { status: 500 });
  }
}
