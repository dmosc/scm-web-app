import { gql } from 'apollo-boost';

const GET_CLIENTS = gql`
  query clientsCreatedIn($filters: ClientsCreatedInRangeFilters!) {
    clientsCreatedIn(filters: $filters) {
      id
      uniqueId
      businessName
      createdAt
    }
  }
`;

export { GET_CLIENTS };
