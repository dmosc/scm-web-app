import path from 'path';
import { Storage } from '@google-cloud/storage';
import moment from 'moment-timezone';
import { GCLOUD_BUCKET } from '../../../config';

const storage = new Storage();

const uploadStream = (createReadStream, gcloudFile) =>
  new Promise((resolve, reject) => {
    createReadStream()
      .pipe(
        gcloudFile.createWriteStream({
          public: true,
          gzip: true,
          metadata: {
            cacheControl: 'public, max-age=31536000'
          }
        })
      )
      .on('end', reject)
      .on('finish', resolve);
  });

const uploaders = {
  fileUpload: async (_, { file, folderKey, id }) => {
    try {
      const { createReadStream, filename } = await file;

      const extensionIndex = filename.lastIndexOf('.');
      const newFilename = `${filename.substring(0, extensionIndex)}_${moment().format(
        'DD-MM-YY'
      )}${filename.substring(extensionIndex)}`;

      const filePath = path.join(folderKey, id, newFilename).replace(/\\/g, '/');

      const gcloudFile = storage.bucket(GCLOUD_BUCKET).file(filePath);

      await uploadStream(createReadStream, gcloudFile);

      return `https://storage.cloud.google.com/${GCLOUD_BUCKET}/${filePath}`;
    } catch (err) {
      throw new Error(err);
    }
  },
  // In future versions, this image upload should validate image type and encoding, in order
  // to ensure data integrity. Check https://github.com/foliojs/pdfkit/blob/master/lib/image.js
  // as an example of encoding validation by type.
  imageUpload: async (_, { image, folderKey, id }) => {
    try {
      const type = image.split(';')[0].split('/')[1];
      const newFilename = Date.now() + id + type;

      const Body = Buffer.from(image.replace(/^data:image\/\w+;base64,/, ''), 'base64');

      const filePath = path.join(folderKey, id, newFilename).replace(/\\/g, '/');

      await storage
        .bucket(GCLOUD_BUCKET)
        .file(filePath)
        .save(Body, {
          public: true,
          gzip: true,
          metadata: {
            cacheControl: 'public, max-age=31536000'
          }
        });

      return `https://storage.cloud.google.com/${GCLOUD_BUCKET}/${filePath}`;
    } catch (err) {
      throw new Error(err);
    }
  }
};

export default uploaders;
