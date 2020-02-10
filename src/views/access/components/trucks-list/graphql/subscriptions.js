import { gql } from 'apollo-boost';

const ACTIVE_TICKETS = gql`
  subscription activeTickets {
    activeTickets {
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

export { ACTIVE_TICKETS };
