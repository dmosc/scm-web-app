import migrate from 'migrate';
import mongoose, { Schema } from 'mongoose';
import path from 'path';
import { MONGO_DB_URI } from '../../config';

const migratePromise = new Promise((resolve, reject) => {
  migrate.load(
    {
      stateStore: path.join(__dirname, './.migrate'),
      migrationsDirectory: path.join(__dirname, './migrations')
    },
    (err, set) => {
      if (err) {
        reject(err);
      }
      set.up(error => {
        if (error) {
          reject(error);
        }
        resolve();
      });
    }
  );
});

const run = async () => {
  console.info('Running migrations');

  try {
    await mongoose.connect(MONGO_DB_URI, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
      useUnifiedTopology: true
    });

    Schema.Types.String.checkRequired(v => v !== null);
    await migratePromise;
    mongoose.connection.close();
    console.info('Migrations run correctly');
  } catch (err) {
    console.info(err);
  }
};

run();
