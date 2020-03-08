import { gql } from 'apollo-boost';

const ACTIVE_TICKETS = gql`
  subscription activeTickets {
    activeTickets {
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

const LOADED_TICKETS = gql`
  subscription loadedTickets {
    loadedTickets {
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

export { ACTIVE_TICKETS, LOADED_TICKETS };
