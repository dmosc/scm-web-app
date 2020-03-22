import { gql } from 'apollo-boost';

const GET_CLIENT_TICKETS_PENDING_TO_BILL = gql`
  query ticketsPendingToBill($client: ID!) {
    ticketsPendingToBill(client: $client) {
      id
      folio
      tax
      totalPrice
      product {
        name
      }
    }
  }
`;

export { GET_CLIENT_TICKETS_PENDING_TO_BILL };
