import authenticated from '../../middleware/authenticated';
import { Lap } from '../../../mongo-db/models';

const lapQueries = {
  lapActive: authenticated(async (_, __, { req: { userRequesting } }) => {
    return Lap
      .findOne({ end: { $exists: false }, driver: userRequesting.id })
      .populate('driver machine turn observations');
  }),
  activeLaps: authenticated(async () => {
    return Lap
      .find({ end: { $exists: false } })
      .populate('driver machine turn observations');
  })
};

export default lapQueries;