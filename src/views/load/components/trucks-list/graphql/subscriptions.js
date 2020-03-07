import { gql } from 'apollo-boost';

const ACTIVE_TICKETS = gql`
  subscription notLoadedActiveTickets {
    notLoadedActiveTickets {
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

export { ACTIVE_TICKETS };
