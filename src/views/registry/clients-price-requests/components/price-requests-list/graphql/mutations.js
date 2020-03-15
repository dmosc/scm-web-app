import { gql } from 'apollo-boost';

const EDIT_PRICE_REQUEST = gql`
  mutation priceRequestEdit($priceRequest: PriceRequestEditInput!) {
    priceRequestEdit(priceRequest: $priceRequest) {
      id
    }
  }
`;

export { EDIT_PRICE_REQUEST };
