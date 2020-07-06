import authenticated from '../../middleware/authenticated';
import { Observation } from '../../../mongo-db/models';

const observationQueries = {
  observationsFromLap: authenticated(async (_, { lap }) => {
    return Observation.find({ lap }).populate('lap');
  }),
  observationActive: authenticated(async (_, { lap }) => {
    return Observation
      .findOne({ end: { $exists: false }, lap })
      .populate('lap');
  })
};

export default observationQueries;