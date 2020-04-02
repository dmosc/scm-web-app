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

const GET_SIMILAR_TRUCKS = gql`
  query similarTrucks($plates: String!) {
    similarTrucks(plates: $plates) {
      id
      client {
        id
        businessName
      }
    }
  }
`;

const DECIPHER_PLATES = gql`
  query truckDecipherPlates($cipheredPlates: String!) {
    truckDecipherPlates(cipheredPlates: $cipheredPlates)
  }
`;

export { GET_ROCKS, GET_SIMILAR_TRUCKS, DECIPHER_PLATES };
