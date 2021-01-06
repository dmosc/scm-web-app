import mongoose, { Schema } from 'mongoose';
import events from 'events';
import cron from 'node-cron';
import 'moment/locale/es';
import server from './graphql';
import { api, cronjobs, mongoDB } from './config/loggers';
import { API_PORT, MONGO_DB_URI } from './config';
import { dailyTasks, tasks } from './utils/cronjobs';

(async () => {
  try {
    mongoDB.await('Connecting with MongoDB database');

    await Promise.all([
      mongoose.connect(MONGO_DB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false
      })
    ]);

    Schema.Types.String.checkRequired(v => v !== null);
    mongoDB.success(`📀 Succesfully connected to database: ${MONGO_DB_URI}`);

    cron.schedule(
      '0 8 * * *',
      () => {
        cronjobs.await('Executing cronjobs');
        Object.keys(dailyTasks).forEach(async task => {
          if (tasks[task]) {
            const result = await tasks[task]();
            if (result) {
              cronjobs.success(`✅  Completed task ${task}`);
            } else {
              cronjobs.error(`❌  Failed task ${task}`);
            }
          }
        });
      },
      { scheduled: true, timezone: 'America/Monterrey' }
    );

    cron.schedule(
      '* * * * *',
      () => {
        cronjobs.await('Executing cronjobs');
        Object.keys(tasks).forEach(async task => {
          if (tasks[task]) {
            const result = await tasks[task]();
            if (result) {
              cronjobs.success(`✅  Completed task ${task}`);
            } else {
              cronjobs.error(`❌  Failed task ${task}`);
            }
          }
        });
      },
      { scheduled: true, timezone: 'America/Monterrey' }
    );

    const { url, subscriptionsUrl } = await server.listen(API_PORT);
    api.success(`🚀  Server ready at ${url}`);
    api.success(`🚀  Subscriptions ready at ${subscriptionsUrl}`);

    events.EventEmitter.defaultMaxListeners = 100;
  } catch (e) {
    console.error.bind(console, e);
  }
})();
