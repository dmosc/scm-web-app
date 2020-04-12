import { gql } from 'apollo-boost';

const REGISTER_PRODUCT = gql`
  mutation rock($rock: RockInput!) {
    rock(rock: $rock) {
      id
      name
      price
      floorPrice
      color
    }
  }
`;

export { REGISTER_PRODUCT };
