import { Types } from 'mongoose';
import authenticated from '../../middleware/authenticated';
import { Lap, ProductionTurn } from '../../../mongo-db/models';

const productionTurnQueries = {
  productionTurn: authenticated(async (_, args) => {
    const { id } = args;
    const productionTurn = await ProductionTurn.findOne({ _id: id }).populate('laps');

    if (!productionTurn) throw new Error('¡No ha sido posible encontrar el turno de producción!');

    return productionTurn;
  }),
  productionTurns: authenticated(
    async (
      _,
      { filters: { limit, start = new Date('1970-01-01'), end = new Date('2100-12-31') } }
    ) => {
      const query = {};
      if (start) query.start = { $gte: start };
      if (end) query.end = { $lte: end };
      const productionTurns = await ProductionTurn.find(query)
        .limit(limit || Number.MAX_SAFE_INTEGER)
        .populate('laps');

      if (!productionTurns) throw new Error('¡Ha habido un error cargando los turno de producción!');

      return productionTurns;
    }
  ),
  productionTurnActive: authenticated(() => {
    return ProductionTurn.findOne({ end: { $exists: false } }).populate('laps');
  }),
  productionTurnSummary: authenticated(async (_, { id }) => {
    const $match = {
      turn: Types.ObjectId(id),
      end: { $exists: true },
      deleted: false
    };

    const observationsResults = await Lap.aggregate([
      {
        $match
      },
      { $lookup: { from: 'observations', localField: 'observations', foreignField: '_id', as: 'observations' } },
      { $unwind: '$observations' },
      {
        $group: {
          _id: null,
          observationsTime: { $sum: { $subtract: ['$observations.end', '$observations.start'] } }
        }
      },
      { $project: { _id: 0, observationsTime: '$observationsTime' } }
    ]);
    const lapsResults = await Lap.aggregate([
      {
        $match
      },
      { $lookup: { from: 'users', localField: 'driver', foreignField: '_id', as: 'driver' } },
      { $lookup: { from: 'machines', localField: 'machine', foreignField: '_id', as: 'machine' } },
      { $lookup: { from: 'observations', localField: 'observations', foreignField: '_id', as: 'observations' } },
      {
        $group: {
          _id: null,
          totalLaps: { $sum: { $cond: [{ $eq: ['$tons', 0] }, 0, 1] } },
          tons: { $sum: '$tons' },
          totalMinutes: { $sum: { $subtract: ['$end', '$start'] } },
          laps: {
            $push: {
              id: '$_id',
              start: '$start',
              end: '$end',
              tons: '$tons',
              driver: '$driver',
              machine: '$machine',
              turn: '$turn',
              observations: '$observations'
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          totalLaps: '$totalLaps',
          tons: '$tons',
          totalMinutes: '$totalMinutes',
          laps: '$laps'
        }
      }
    ]);

    let results = {
      totalLaps: 0,
      tons: 0,
      effectiveMinutes: 0,
      totalMinutes: 0,
      laps: []
    };

    if (lapsResults.length > 0) {
      const [lapsResultsToSet] = lapsResults;
      const filteredLaps = lapsResultsToSet.laps.map(lap => {
        const driver = lap.driver[0];
        const machine = lap.machine[0];

        driver.id = driver._id;
        machine.id = machine._id;

        delete driver._id;
        delete machine._id;

        return { ...lap, driver, machine };
      });

      lapsResultsToSet.laps = [...filteredLaps];

      results = { ...results, ...lapsResultsToSet };
    }

    if (observationsResults.length > 0) {
      const [{ observationsTime }] = observationsResults;
      results.effectiveMinutes = results.totalMinutes - observationsTime;
    }

    // To get exact minutes from Date object, divide by 60000
    results.totalMinutes = (results.totalMinutes / 60000).toFixed(2);
    results.effectiveMinutes = (results.effectiveMinutes / 60000).toFixed(2);

    return results;
  })
};

export default productionTurnQueries;