import { gql } from 'apollo-boost';

const GET_ACTIVE_TICKETS = gql`
  query activeTickets($filters: TicketFilters!) {
    activeTickets(filters: $filters) {
      id
      folio
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
    }
  }
`;

export { GET_ACTIVE_TICKETS };
