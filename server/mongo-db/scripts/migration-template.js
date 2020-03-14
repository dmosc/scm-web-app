// import { /* models required */ } from "../models";

const up = async next => {
  console.info('Up <migration-name>');

  next();
};

export { up };
