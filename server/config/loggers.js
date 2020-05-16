import { Signale } from 'signale';

const mongoDB = new Signale({
  interactive: true,
  scope: 'db',
  config: {
    displayTimestamp: true,
    displayDate: true
  }
});

const auroraDB = new Signale({
  interactive: true,
  scope: 'db',
  config: {
    displayTimestamp: true,
    displayDate: true
  }
});

const cronjobs = new Signale({
  interactive: true,
  scope: 'cronjobs',
  config: {
    displayTimestamp: true,
    displayDate: true
  }
});

const seeder = new Signale({
  interactive: true,
  scope: 'db:seed',
  config: {
    displayTimestamp: true,
    displayDate: true
  }
});

const dropper = new Signale({
  interactive: true,
  scope: 'db:drop',
  config: {
    displayTimestamp: true,
    displayDate: true
  }
});

const api = new Signale({
  scope: 'api',
  config: {
    displayTimestamp: true,
    displayDate: true
  }
});

export { mongoDB, auroraDB, cronjobs, seeder, dropper, api };
