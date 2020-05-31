import moment from 'moment';
import authenticated from '../../middleware/authenticated';
import { Goal } from '../../../mongo-db/models';

const goalMutations = {
  goal: authenticated(async (_, args) => {
    const goal = new Goal({ ...args.goal });

    goal.name = goal.name.toUpperCase();
    goal.start = moment()
      .startOf(goal.period)
      .set({ hours: 0, minutes: 0, seconds: 0 });
    goal.end = moment()
      .endOf(goal.period)
      .set({ hours: 23, minutes: 59, seconds: 59 });

    await goal.save();
    return Goal.findById(goal.id).populate('rocks');
  }),
  goalDelete: authenticated(async (_, { id }, { req: { userRequesting } }) => {
    try {
      await Goal.deleteById(id, userRequesting.id);
      return true;
    } catch (e) {
      return e;
    }
  })
};

export default goalMutations;
