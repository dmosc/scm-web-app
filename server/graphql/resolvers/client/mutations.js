import {Client} from '../../../database/models';
import authenticated from '../../middleware/authenticated';

const clientMutations = {
  client: authenticated(async (_, args) => {
    const client = new Client({...args.client});

    client.firstName = client.firstName.toUpperCase().trim();
    client.lastName = client.lastName.toUpperCase().trim();
    client.businessName = client.businessName.toUpperCase().trim();
    client.username = client.businessName;
    client.rfc = client.rfc.toUpperCase().trim();
    client.address = client.address.toUpperCase().trim();
    client.email = client.email.toLowerCase().trim();

    try {
      await client.save();
      return client;
    } catch (e) {
      return e;
    }
  }),
};

export default clientMutations;