import mongoose, {Schema} from 'mongoose';
import server from './graphql';
import {ENV, API_PORT, MONGO_DB_URI} from './config';

(async () => {
  try {
    server
      .listen(ENV.production ? API_PORT : 80)
      .then(({url, subscriptionsUrl}) => {
        console.log(`🚀  Server ready at ${url}`);
        console.log(`🚀  Subscriptions ready at ${subscriptionsUrl}`);
      });

    await mongoose
      .connect(MONGO_DB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false,
      })
      .then(() => {
        Schema.Types.String.checkRequired(v => v !== null);
        console.log(`Succesfully connected to database: ${MONGO_DB_URI} 📀`);
      });
  } catch (e) {
    console.error.bind(console, e);
  }
})();
