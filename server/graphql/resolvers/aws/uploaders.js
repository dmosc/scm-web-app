import path from 'path';
import moment from 'moment-timezone';
import S3 from '../../../clients/aws/s3';
import { S3_BUCKET } from '../../../config';

export const S3Upload = params =>
  new Promise((resolve, reject) =>
    S3.upload(params, (err, data) => {
      if (err) reject(err);
      if (data) resolve(data);
    })
  );

const uploaders = {
  fileUpload: async (_, { file, folderKey, id }) => {
    try {
      const { createReadStream, filename } = await file;

      const stream = createReadStream();
      const newFilename = `${filename}_${moment().format('DD-MM-YY')}`;

      const S3Path = path.join(folderKey, id, newFilename).replace(/\\/g, '/');

      const params = {
        Bucket: S3_BUCKET,
        Body: stream,
        Key: S3Path,
        ACL: 'public-read'
      };

      const { Location } = await S3Upload(params);

      return Location;
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
      const S3Path = path.join(folderKey, id, newFilename).replace(/\\/g, '/');

      const Body = Buffer.from(image.replace(/^data:image\/\w+;base64,/, ''), 'base64');

      const params = {
        Bucket: S3_BUCKET,
        Body,
        Key: S3Path,
        ACL: 'public-read',
        ContentEncoding: 'base64',
        ContentType: `image/${type}`
      };

      const { Location } = await S3Upload(params);

      return Location;
    } catch (err) {
      throw new Error(err);
    }
  }
};

export default uploaders;
