import { gql } from 'apollo-boost';

const GET_SPECIAL_PRICES = gql`
  query clientPricesByClient($client: ID!) {
    clientPricesByClient(client: $client) {
      id
      rock {
        id
        name
      }
      price
    }
  }
`;

export { GET_SPECIAL_PRICES };
