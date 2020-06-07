import { gql } from 'apollo-boost';

const GET_REPORT = gql`
  query archivedTicketsXLS($filters: ArchivedTicketFilters!) {
    archivedTicketsXLS(filters: $filters)
  }
`;

const GET_PRODUCTS = gql`
  query rocks($filters: RockFilters!) {
    rocks(filters: $filters) {
      id
      name
    }
  }
`;

const GET_CLIENTS = gql`
  query clients($filters: ClientFilters!) {
    clients(filters: $filters) {
      id
      businessName
    }
  }
`;

export { GET_REPORT, GET_PRODUCTS, GET_CLIENTS };
