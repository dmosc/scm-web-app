import { gql } from 'apollo-boost';

const GET_TICKETS = gql`
  query tickets($filters: TicketFilters!) {
    tickets(filters: $filters) {
      id
      folio
      client {
        businessName
      }
      truck {
        plates
      }
      product {
        name
      }
    }
  }
`;

export { GET_TICKETS };
