import authenticated from '../../middleware/authenticated';
import { Lap, ProductionTurn } from '../../../mongo-db/models';

const lapMutations = {
  lapInit: authenticated(async (_, args, { pubsub, req: { userRequesting } }) => {
    const activeTurn = await ProductionTurn.findOne({ end: { $exists: false } });
    const machineInUse = await Lap.findOne({
      end: { $exists: false },
      machine: args.lap.machine
    });

    if (machineInUse) throw new Error('Esta máquina ya está activa!');
    if (!activeTurn) throw new Error('Un turno activo es necesario para iniciar vueltas!');

    const lap = new Lap({ ...args.lap });

    lap.start = new Date();
    lap.driver = userRequesting.id;

    try {
      await lap.save();

      const activeLaps = await Lap.find({ end: { $exists: false } }).populate(
        'driver machine turn observations'
      );

      pubsub.publish('ACTIVE_LAPS', { activeLaps });
      pubsub.publish('LAP_UPDATE', { lapUpdate: lap });

      return Lap.findById(lap.id).populate('driver machine turn observations');
    } catch (e) {
      return e;
    }
  }),
  lapEnd: authenticated(async (_, args, { pubsub }) => {
    const activeTurn = await ProductionTurn.findOne({ end: { $exists: false } });

    if (!activeTurn) throw new Error('Un turno activo es necesario para finalizar vueltas!');

    const lap = await Lap.findById(args.lap.id);

    lap.end = new Date();
    lap.turn = activeTurn.id;

    activeTurn.laps.push(lap.id);

    try {
      await lap.save();
      await activeTurn.save();

      const activeLaps = await Lap.find({ end: { $exists: false } }).populate(
        'driver machine turn observations'
      );

      pubsub.publish('ACTIVE_LAPS', { activeLaps });
      pubsub.publish('LAP_UPDATE', { lapUpdate: lap });

      return Lap.findById(lap.id).populate('driver machine turn observations');
    } catch (e) {
      return e;
    }
  }),
  lapCancel: authenticated(async (_, { lap }, { pubsub }) => {
    const lapToCancel = await Lap.findById(lap.id);
    const activeTurn = await ProductionTurn.findOne({ end: { $exists: false } });

    if (!activeTurn) throw new Error('Un turno activo es necesario para cancelar vueltas!');

    lapToCancel.end = new Date();
    lapToCancel.turn = activeTurn.id;
    lapToCancel.tons = 0;

    activeTurn.laps.push(lap.id);

    try {
      await lapToCancel.save();

      const activeLaps = await Lap.find({ end: { $exists: false } }).populate(
        'driver machine turn observations'
      );

      pubsub.publish('ACTIVE_LAPS', { activeLaps });
      pubsub.publish('LAP_UPDATE', { lapUpdate: lapToCancel });

      return Lap.findById(lapToCancel.id).populate('driver machine turn observations');
    } catch (e) {
      return e;
    }
  })
};

export default lapMutations;
