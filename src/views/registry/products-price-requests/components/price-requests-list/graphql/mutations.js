import { gql } from 'apollo-boost';

const EDIT_PRICE_REQUEST = gql`
  mutation rockPriceRequestEdit($rockPriceRequest: RockPriceRequestEditInput!) {
    rockPriceRequestEdit(rockPriceRequest: $rockPriceRequest) {
      id
    }
  }
`;

export { EDIT_PRICE_REQUEST };
