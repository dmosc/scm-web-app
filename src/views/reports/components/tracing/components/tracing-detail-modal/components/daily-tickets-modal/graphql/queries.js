import { gql } from 'apollo-boost';

const GET_TICKETS_IN_RANGE = gql`
  query ticketsByClient($clientId: ID!, $range: DateRange) {
    ticketsByClient(clientId: $clientId, range: $range) {
      id
      folio
      tax
      weight
      totalWeight
      totalPrice
      credit
      product {
        id
        name
      }
    }
  }
`;

export { GET_TICKETS_IN_RANGE };
