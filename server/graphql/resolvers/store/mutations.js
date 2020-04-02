import { Store } from '../../../mongo-db/models';
import authenticated from '../../middleware/authenticated';

const storeMutations = {
  store: async (_, args) => {
    const store = new Store({ ...args.store });

    if (store.address) store.address = args.store.address.toLowerCase().trim();
    if (store.state) store.state = args.store.state.toLowerCase().trim();
    if (store.municipality) store.municipality = args.store.municipality.toLowerCase().trim();
    store.name = args.store.name.toLowerCase().trim();

    await store.save();

    return Store.findOne({ _id: store.id }).populate('client');
  },
  storeEdit: authenticated(async (_, args) =>
    Store.findOneAndUpdate({ _id: args.store.id }, { ...args.store }, { new: true }).populate(
      'client'
    )
  ),
  storeDelete: authenticated(async (_, { id }, { req: { userRequesting } }) => {
    try {
      await Store.deleteById(id, userRequesting.id);
      return true;
    } catch (e) {
      return e;
    }
  })
};

export default storeMutations;
