import { gql } from 'apollo-boost';

const SET_PRODUCT_RATE = gql`
  mutation productRate($rate: Float!) {
    productRate(rate: $rate) {
      id
      rate
    }
  }
`;

export { SET_PRODUCT_RATE };
