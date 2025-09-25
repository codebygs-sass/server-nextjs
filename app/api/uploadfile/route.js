import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import { parseFile } from "music-metadata";

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("files"); // Make sure this matches `FormData.append('files', ...)` on the frontend

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Convert the File into a buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileName = `${Date.now()}-${file.name}`;

    // Create the file path (inside /public/uploads)
    const filePath = path.join(process.cwd(), "public", "uploads", fileName);

    // Save file to disk
    await writeFile(filePath, buffer);

    // Parse metadata from the saved file
    const metadata = await parseFile(filePath);
    const duration = metadata.format.duration?.toFixed(2);
    const mimeType = metadata.format.mimeType || file.type;

    const minutes = Math.floor(duration / 60); // → 5
const seconds = (duration % 60).toFixed(0); // → 16

const formatted = `${minutes}m ${seconds}s`;

    return NextResponse.json({
      message: "File uploaded and analyzed successfully",
      fileName,
      duration:formatted,
      mimeType,
      size: file.size,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "File upload failed" }, { status: 500 });
  }
}
