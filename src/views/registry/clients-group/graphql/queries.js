import { gql } from 'apollo-boost';

const GET_CLIENTS_GROUPS = gql`
  query clientsGroups($filters: ClientsGroupFilters!) {
    clientsGroups(filters: $filters) {
      id
      name
      clients {
        id
        businessName
      }
    }
  }
`;

export { GET_CLIENTS_GROUPS };
