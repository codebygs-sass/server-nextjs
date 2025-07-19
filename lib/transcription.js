// lib/transcription.js
import { createClient } from '@deepgram/sdk';
import fs from 'fs'

export async function transcribeAudio(audioFilePath) {
  const deepgram = createClient(process.env.NEXT_APP_DEEPGRAM_API_KEY);
  const response = await deepgram.listen.prerecorded.transcribeFile(
  fs.createReadStream(audioFilePath),
   {
                punctuate: true,
                smart_format: true,
                diarize: true,   // ✅ Enable speaker separation
                model: 'general',
                summarize: true,
     }
);
  return response;
}

