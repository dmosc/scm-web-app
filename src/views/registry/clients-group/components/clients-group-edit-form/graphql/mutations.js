import { gql } from 'apollo-boost';

const EDIT_CLIENTS_GROUP = gql`
  mutation clientsGroupEdit($clientsGroup: ClientsGroupEditInput!) {
    clientsGroupEdit(clientsGroup: $clientsGroup) {
      id
      name
      clients {
        id
        businessName
      }
    }
  }
`;

export { EDIT_CLIENTS_GROUP };
