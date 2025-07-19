import ffmpeg from "fluent-ffmpeg";
import { fileURLToPath } from "url";
import { dirname } from "path";
import path from "path";
import fs from "fs";

// Fix: Import the binary correctly using `require` to avoid `.next` resolution
const ffmpegStaticPath = require("ffmpeg-static");

ffmpeg.setFfmpegPath(ffmpegStaticPath);

export function extractAudio(videoPath, audioOutputPath) {
  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .output(audioOutputPath)
      .audioCodec("pcm_s16le")
      .on("end", () => resolve(audioOutputPath))
      .on("error", reject)
      .run();
  });
}
