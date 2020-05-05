import { gql } from 'apollo-boost';

const REGISTER_CLIENTS_GROUP = gql`
  mutation clientsGroup($clientsGroup: ClientsGroupInput!) {
    clientsGroup(clientsGroup: $clientsGroup) {
      id
      name
      clients {
        id
        businessName
      }
    }
  }
`;

export { REGISTER_CLIENTS_GROUP };
