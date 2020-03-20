import gql from 'graphql-tag';

const GET_HISTORY_PRICES = gql`
  query clientPriceHistoryByClient($client: ID!, $rock: ID) {
    clientPriceHistoryByClient(client: $client, rock: $rock) {
      id
      rock {
        id
        name
      }
      price
      addedAt
      setBy {
        id
        firstName
        lastName
      }
      noSpecialPrice
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

export { GET_HISTORY_PRICES, GET_ROCKS };
