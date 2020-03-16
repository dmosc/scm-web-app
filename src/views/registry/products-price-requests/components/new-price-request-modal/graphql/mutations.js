import { gql } from 'apollo-boost';

const ADD_PRICE_REQUEST = gql`
  mutation rockPriceRequest($rockPriceRequest: RockPriceRequestInput!) {
    rockPriceRequest(rockPriceRequest: $rockPriceRequest) {
      id
    }
  }
`;

export { ADD_PRICE_REQUEST };
