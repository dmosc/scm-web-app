import { gql } from 'apollo-boost';

const GET_CLIENTS_PENDING_TICKETS_TO_BILL = gql`
  query clientsPendingTicketsToBill {
    clientsPendingTicketsToBill {
      client {
        id
        businessName
      }
      count
    }
  }
`;

export { GET_CLIENTS_PENDING_TICKETS_TO_BILL };
