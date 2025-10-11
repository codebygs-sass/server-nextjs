// app/api/download/route.js
import fs from "fs";
import fsPromises from "fs/promises";
import path from "path";
import https from "https";
import { v4 as uuidv4 } from "uuid";

export async function POST(request) {
  try {
    const { fileUrl } = await request.json();

    if (!fileUrl) {
      return new Response(JSON.stringify({ error: "No file URL provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Create a temp directory
    const tempDir = path.join(process.cwd(), "temp");
    await fsPromises.mkdir(tempDir, { recursive: true });

    // Generate unique name
    const fileExt = path.extname(fileUrl.split("?")[0]) || ".mp4";
    const tempFileName = `${uuidv4()}${fileExt}`;
    const tempFilePath = path.join(tempDir, tempFileName);

    await downloadFile(fileUrl, tempFilePath);

    console.log("✅ File downloaded:", tempFileName);

    return new Response(
      JSON.stringify({ fileId: tempFileName, message: "File downloaded" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Download error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// Helper: Download file from a URL
function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    https
      .get(url, (response) => {
        if (response.statusCode !== 200) {
          return reject(new Error(`Failed to download file: ${response.statusCode}`));
        }
        response.pipe(file);
        file.on("finish", () => file.close(resolve));
      })
      .on("error", (err) => {
        fs.unlink(destPath, () => reject(err));
      });
  });
}
