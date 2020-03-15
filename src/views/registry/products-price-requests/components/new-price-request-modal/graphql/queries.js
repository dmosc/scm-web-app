import { gql } from 'apollo-boost';

const GET_ROCKS = gql`
  query rocks($filters: RockFilters!) {
    rocks(filters: $filters) {
      id
      name
      color
      price
      floorPrice
    }
  }
`;

export { GET_ROCKS };
