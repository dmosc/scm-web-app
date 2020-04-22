import { gql } from 'apollo-boost';

const GET_QUOTATIONS = gql`
  query quotations($filters: QuotationFilters!) {
    quotations(filters: $filters) {
      id
      client
      createdAt
      validUntil
      freight
      products {
        rock {
          id
          name
        }
        price
      }
    }
  }
`;

export { GET_QUOTATIONS };
