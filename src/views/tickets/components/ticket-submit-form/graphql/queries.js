import { gql } from 'apollo-boost';

const GET_TRUCK_DRIVERS = gql`
  query truck($id: ID!) {
    truck(id: $id) {
      id
      drivers
    }
  }
`;

const GET_SPECIAL_PRICE = gql`
  query clientPriceByClient($client: ID!, $rock: ID!) {
    clientPriceByClient(client: $client, rock: $rock) {
      id
      price
    }
  }
`;

export { GET_TRUCK_DRIVERS, GET_SPECIAL_PRICE };
