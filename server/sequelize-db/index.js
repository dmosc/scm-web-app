import Sequelize from 'sequelize';
import { AWS_CONFIG } from '../config';

const {
  AURORA_DB_NAME,
  AURORA_DB_USERNAME,
  AURORA_DB_PASSWORD,
  AURORA_DB_HOST,
  AURORA_DB_PORT
} = AWS_CONFIG;

const sequelize = new Sequelize(AURORA_DB_NAME, AURORA_DB_USERNAME, AURORA_DB_PASSWORD, {
  host: AURORA_DB_HOST,
  port: AURORA_DB_PORT,
  logging: false,
  maxConcurrentQueries: 100,
  dialect: 'mysql',
  dialectOptions: {
    ssl: 'Amazon RDS',
    connectTimeout: 60000
  },
  pool: { maxConnections: 5, maxIdleTime: 30 },
  language: 'en'
});

export default sequelize;
