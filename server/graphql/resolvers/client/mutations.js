import { Client } from '../../../mongo-db/models';
import authenticated from '../../middleware/authenticated';

const clientMutations = {
  client: authenticated(async (_, args) => {
    const client = new Client({ ...args.client });
    const [{ uniqueId }] = await Client.find({})
      .sort({ uniqueId: -1 })
      .limit(1);

    client.firstName = client.firstName.toUpperCase().trim();
    client.lastName = client.lastName.toUpperCase().trim();
    client.businessName = client.businessName.toUpperCase().trim();
    client.uniqueId = uniqueId + 1;

    if(client.rfc) client.rfc = client.rfc.toUpperCase().trim();
    else delete client.rfc;

    if(client.email) client.email = client.email.toLowerCase().trim();
    else delete client.email;

    if(client.address) {
      Object.keys(client.address).forEach(key => {
        client.address[key] = client.address[key].toUpperCase().trim();
      });
    } else delete client.address;

    await client.save();
    return Client.findOne({ _id: client.id }).populate('prices.rock');
  }),
  clientEdit: authenticated(async (_, args) => {
    try {
      return await Client.findOneAndUpdate(
        { _id: args.client.id },
        { ...args.client },
        { new: true }
      ).populate('prices.rock');
    } catch (e) {
      return e;
    }
  }),
  clientDelete: authenticated(async (_, { id }, { req: { userRequesting } }) => {
    try {
      await Client.deleteById(id, userRequesting.id);
      return true;
    } catch (e) {
      return e;
    }
  })
};

export default clientMutations;
