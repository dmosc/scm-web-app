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

const { API_PORT } = process.env;
const { MONGO_DB_URI } = process.env;
const { JWT_SECRET } = process.env;
const { GCLOUD_BUCKET } = process.env;
const { AES_SECRET } = process.env;
const { ACCOUNT_SID } = process.env;
const { TWILIO_AUTH_TOKEN } = process.env;
const { TWILIO_PHONE_NUMBER } = process.env;

export {
  ENV,
  AWS_CONFIG,
  API_PORT,
  MONGO_DB_URI,
  JWT_SECRET,
  AES_SECRET,
  ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_PHONE_NUMBER,
  GCLOUD_BUCKET
};
