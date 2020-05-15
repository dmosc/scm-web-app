import dotenv from 'dotenv';

dotenv.config();

const SERVER_URI = process.env.REACT_APP_SERVER_URI;
const WS_URI = process.env.REACT_APP_WS_URI;
const LOCAL_SERVER_URI = process.env.REACT_APP_LOCAL_SERVER_URI;
const LOCAL_WS_URI = process.env.REACT_APP_LOCAL_WS_URI;
const LOG_ROCKET_ID = process.env.REACT_APP_LOG_ROCKET_ID;
const ENV = {
  PRODUCTION: process.env.NODE_ENV === 'production',
  DEVELOPMENT: process.env.NODE_ENV === 'development'
};

export { SERVER_URI, WS_URI, LOCAL_SERVER_URI, LOCAL_WS_URI, LOG_ROCKET_ID, ENV };
