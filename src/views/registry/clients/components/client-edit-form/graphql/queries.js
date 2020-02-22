import { gql } from 'apollo-boost';

const GET_PRODUCTS = gql`
  query rocks($filters: RockFilters!) {
    rocks(filters: $filters) {
      id
      name
      price
      floorPrice
    }
  }
`;

export { GET_PRODUCTS };
