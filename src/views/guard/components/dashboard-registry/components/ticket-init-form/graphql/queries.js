import { gql } from 'apollo-boost';

const GET_ROCKS = gql`
  query rocks($filters: RockFilters!) {
    rocks(filters: $filters) {
      id
      name
      price
      color
    }
  }
`;

const GET_TRUCK = gql`
  query truck($plates: String!) {
    truck(plates: $plates) {
      id
    }
  }
`;

export { GET_ROCKS, GET_TRUCK };
