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

const GET_CLIENT_TICKETS_PENDING_TO_BILL = gql`
  query ticketsPendingToBill($client: ID!, $type: TicketBillType!) {
    ticketsPendingToBill(client: $client, type: $type) {
      id
      folio
      tax
      totalPrice
      out
      product {
        name
      }
    }
  }
`;

export { GET_CLIENTS_PENDING_TICKETS_TO_BILL, GET_CLIENT_TICKETS_PENDING_TO_BILL };
