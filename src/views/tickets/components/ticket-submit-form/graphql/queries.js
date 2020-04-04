import { gql } from 'apollo-boost';

const GET_TRUCK_DRIVERS = gql`
  query truck($id: ID!, $client: ID!) {
    truck(id: $id, client: $client) {
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

const GET_CREDIT_LIMIT = gql`
  query clientCreditLimit($client: ID!) {
    clientCreditLimit(client: $client) {
      id
      creditLimit
    }
  }
`;

export { GET_TRUCK_DRIVERS, GET_SPECIAL_PRICE, GET_CREDIT_LIMIT };
