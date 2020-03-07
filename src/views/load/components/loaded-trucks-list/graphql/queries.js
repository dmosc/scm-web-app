import { gql } from 'apollo-boost';

const GET_LOADED_TICKETS = gql`
  query loadedTickets($filters: TicketFilters!) {
    loadedTickets(filters: $filters) {
      id
      folio
      client {
        businessName
      }
      truck {
        plates
      }
      product {
        id
        name
      }
    }
  }
`;

export { GET_LOADED_TICKETS };
