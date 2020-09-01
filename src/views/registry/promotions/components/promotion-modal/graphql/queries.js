import { gql } from 'apollo-boost';

const GET_CLIENTS = gql`
  query clients($filters: ClientFilters!) {
    clients(filters: $filters) {
      id
      businessName
    }
  }
`;

const GET_GROUPS = gql`
  query clientsGroups($filters: ClientsGroupFilters!) {
    clientsGroups(filters: $filters) {
      id
      name
      clients {
        id
      }
    }
  }
`;

const GET_ROCKS = gql`
  query rocks($filters: RockFilters!) {
    rocks(filters: $filters) {
      id
      name
      color
      price
      floorPrice
    }
  }
`;

export { GET_CLIENTS, GET_GROUPS, GET_ROCKS };
