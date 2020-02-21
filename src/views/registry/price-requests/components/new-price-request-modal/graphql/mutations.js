import { gql } from 'apollo-boost';

const ADD_PRICE_REQUEST = gql`
  mutation priceRequest($priceRequest: PriceRequestInput!) {
    priceRequest(priceRequest: $priceRequest) {
      id
    }
  }
`;

export { ADD_PRICE_REQUEST };
