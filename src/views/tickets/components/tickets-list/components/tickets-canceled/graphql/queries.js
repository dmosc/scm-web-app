import { gql } from 'apollo-boost';

const GET_TICKETS_CANCELED = gql`
  query disabledTickets($filters: DisabledTicketFilters!) {
    disabledTickets(filters: $filters) {
      id
      client {
        id
        businessName
      }
      truck {
        id
        plates
      }
      product {
        id
        name
      }
      disabledAt
    }
  }
`;

export { GET_TICKETS_CANCELED };
