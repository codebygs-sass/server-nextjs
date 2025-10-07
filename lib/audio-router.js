// lib/audio-router.js
import { IncomingForm } from 'formidable';
import { parseFile } from 'music-metadata';

export const parseAudioMetadata = (req) => {
  return new Promise((resolve, reject) => {
    const form = new IncomingForm({ keepExtensions: true });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        reject({ status: 500, message: 'Error parsing the file' });
        return;
      }

      const file = files.audio;
      if (!file) {
        reject({ status: 400, message: 'No audio file provided' });
        return;
      }

      try {
        const metadata = await parseFile(file.filepath);
        const duration = metadata.format.duration;
        const mimeType = metadata.format.mimeType;

        resolve({
          duration: duration.toFixed(2),
          mimeType: mimeType || file.mimetype,
        });
      } catch (error) {
        reject({ status: 500, message: 'Error reading metadata' });
      }
    });
  });
};
