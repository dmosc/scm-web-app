import { gql } from 'apollo-boost';

const GET_REPORT = gql`
  query archivedTicketsReport($filters: ArchivedTicketFilters!) {
    archivedTicketsReport(filters: $filters)
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

export { GET_REPORT, GET_PRODUCTS };
