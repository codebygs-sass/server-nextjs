// lib/extractAudio.js
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";

// Set ffmpeg binary path
ffmpeg.setFfmpegPath(ffmpegPath);

/**
 * Extracts audio from a video file
 * @param {string} inputPath - Path to the input video file
 * @param {string} outputPath - Path to save the output audio file
 * @returns {Promise<string>} - Resolves with the audio file path
 */
export function extractAudio(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .noVideo()
      .audioCodec("libmp3lame")
      .format("mp3")
      .on("end", () => {
        console.log("Audio extracted:", outputPath);
        resolve(outputPath);
      })
      .on("error", (err) => {
        console.error("FFmpeg error:", err);
        reject(err);
      })
      .save(outputPath);
  });
}
