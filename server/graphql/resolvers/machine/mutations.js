import { Machine } from '../../../mongo-db/models';
import authenticated from '../../middleware/authenticated';

const machineMutations = {
  machine: authenticated(async (_, args) => {
    const machine = new Machine({ ...args.machine });

    machine.name = machine.name.toUpperCase();
    machine.plates = machine.plates.toUpperCase();
    machine.brand = machine.brand.toUpperCase();
    machine.model = machine.model.toUpperCase();

    try {
      await machine.save();
      return machine;
    } catch (e) {
      return e;
    }
  }),
  machineEdit: authenticated(async (_, args) => {
    const machine = await Machine.findOne({ _id: args.machine.id });

    if (machine.name) machine.name = args.machine.name.toUpperCase();
    if (machine.plates) machine.plates = args.machine.plates.toUpperCase();
    if (machine.brand) machine.brand = args.machine.brand.toUpperCase();
    if (machine.model) machine.model = args.machine.model.toUpperCase();
    if (machine.averageHorometer) machine.averageHorometer = args.machine.averageHorometer.toFixed(2);
    if (machine.standardHorometerDeviation)
      machine.standardHorometerDeviation = args.machine.standardHorometerDeviation.toFixed(2);
    machine.type = args.machine.type;

    // EDIT MUST USE .save() OPERATION TO RUN
    // MODEL VALIDATIONS CORRECTLY. PLEASE AVOID
    // findOneAndUpdate or similars
    return machine.save();
  })
};

export default machineMutations;
