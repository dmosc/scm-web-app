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

const DECIPHER_PLATES = gql`
  query truckDecipherPlates($cipheredPlates: String!) {
    truckDecipherPlates(cipheredPlates: $cipheredPlates)
  }
`;

export { GET_ROCKS, GET_TRUCK, DECIPHER_PLATES };
