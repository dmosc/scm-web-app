import { gql } from 'apollo-boost';

const ADD_QUOTATION = gql`
  mutation quotation($quotation: QuotationInput!) {
    quotation(quotation: $quotation) {
      id
    }
  }
`;

export { ADD_QUOTATION };
