import { ClientsGroup } from '../../../mongo-db/models';
import authenticated from '../../middleware/authenticated';

const clientsGroupMutations = {
  clientsGroup: authenticated(async (_, args) => {
    const clientsGroup = new ClientsGroup({ ...args.clientsGroup });
    clientsGroup.name = clientsGroup.name.toUpperCase();

    try {
      await clientsGroup.save();
      return ClientsGroup.findById(clientsGroup.id).populate('clients');
    } catch (e) {
      return e;
    }
  }),
  clientsGroupEdit: authenticated(async (_, args) => {
    const clientsGroup = await ClientsGroup.findById(args.clientsGroup.id);

    clientsGroup.name = args.clientsGroup.name.toUpperCase();
    clientsGroup.clients = [...args.clientsGroup.clients];

    await clientsGroup.save();

    return ClientsGroup.findById(clientsGroup.id).populate('clients');
  })
};

export default clientsGroupMutations;
