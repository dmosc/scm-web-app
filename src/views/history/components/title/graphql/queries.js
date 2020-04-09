import { gql } from 'apollo-boost';

const GET_REPORT = gql`
  query archivedTicketsXLS($filters: ArchivedTicketFilters!) {
    archivedTicketsXLS(filters: $filters)
  }
`;

const GET_PRODUCTS = gql`
  query rocks($filters: RockFilters!) {
    rocks(filters: $filters) {
      name
    }
  }
`;

export { GET_REPORT, GET_PRODUCTS };
