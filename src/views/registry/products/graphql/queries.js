import { gql } from 'apollo-boost';

const GET_ROCKS = gql`
  query rocks($filters: RockFilters!) {
    rocks(filters: $filters) {
      id
      name
      price
      floorPrice
      color
    }
  }
`;

export { GET_ROCKS };
