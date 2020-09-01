import authenticated from '../../middleware/authenticated';
import { Lap, Observation } from '../../../mongo-db/models';

const observationMutations = {
  observationInit: authenticated(async (_, args) => {
    const isObservationActive = await Observation.findOne({
      end: { $exists: false },
      lap: args.observation.lap
    });

    if (isObservationActive) throw new Error('Ya hay una observación de esta vuelta activa!');

    const observation = new Observation({ ...args.observation });

    observation.start = new Date();

    try {
      await observation.save();
      await Lap.findByIdAndUpdate(observation.lap, { $push: { observations: observation.id } });

      return Observation.findById(observation.id).populate('lap');
    } catch (e) {
      return e;
    }
  }),
  observationEnd: authenticated(async (_, args) => {
    const { id, description } = args.observation;

    return Observation.findByIdAndUpdate(
      id,
      {
        end: new Date(),
        description
      },
      { new: true }
    ).populate('lap');
  })
};

export default observationMutations;
