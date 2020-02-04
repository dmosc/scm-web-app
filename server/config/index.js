import dotenv from 'dotenv';

dotenv.config();

const ENV = {
  development: process.env.NODE_ENV === 'development',
  test: process.env.NODE_ENV === 'test',
  production: process.env.NODE_ENV === 'production'
};

const AWS_CONFIG = {
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
  AURORA_DB_NAME: process.env.AURORA_DB_NAME,
  AURORA_DB_USERNAME: process.env.AURORA_DB_USERNAME,
  AURORA_DB_PASSWORD: process.env.AURORA_DB_PASSWORD,
  AURORA_DB_HOST: process.env.AURORA_DB_HOST,
  AURORA_DB_PORT: process.env.AURORA_DB_PORT
};

const API_PORT = process.env.API_PORT;
const MONGO_DB_URI = process.env.MONGO_DB_URI;
const MONGO_DB_LOCAL_URI = process.env.MONGO_DB_LOCAL_URI;
const S3_BUCKET = process.env.S3_BUCKET;
const S3_REGION = process.env.S3_REGION;
const JWT_SECRET = process.env.JWT_SECRET;

export {
  ENV,
  AWS_CONFIG,
  API_PORT,
  MONGO_DB_URI,
  MONGO_DB_LOCAL_URI,
  S3_BUCKET,
  S3_REGION,
  JWT_SECRET
};
