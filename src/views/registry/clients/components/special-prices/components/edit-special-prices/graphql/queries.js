import gql from 'graphql-tag';

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

const GET_ROCKS = gql`
  query rocks($filters: RockFilters!) {
    rocks(filters: $filters) {
      id
      name
      price
      floorPrice
    }
  }
`;

export { GET_SPECIAL_PRICES, GET_ROCKS };
