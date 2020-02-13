import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.REACT_APP_JWT_SECRET;
const SERVER_URI = process.env.REACT_APP_SERVER_URI;
const WS_URI = process.env.REACT_APP_WS_URI;
const LOCAL_SERVER_URI = process.env.REACT_APP_LOCAL_SERVER_URI;
const LOCAL_WS_URI = process.env.REACT_APP_LOCAL_WS_URI;
const ENV = {
  PRODUCTION: process.env.NODE_ENV === 'production',
  DEVELOPMENT: process.env.NODE_ENV === 'development'
};

export { JWT_SECRET, SERVER_URI, WS_URI, LOCAL_SERVER_URI, LOCAL_WS_URI, ENV };
