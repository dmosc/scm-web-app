import { gql } from 'apollo-boost';

const GET_REPORT = gql`
  query archivedTicketsReport($filters: TicketFilters!) {
    archivedTicketsReport(filters: $filters)
  }
`;

export { GET_REPORT };
