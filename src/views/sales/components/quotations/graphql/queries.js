import { gql } from 'apollo-boost';

const GET_QUOTATIONS = gql`
  query quotations($filters: QuotationFilters!) {
    quotations(filters: $filters) {
      id
      client
      createdAt
      validUntil
      freight
      folio
      createdBy {
        id
        firstName
        lastName
      }
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

const GET_PDF = gql`
  query quotationPDF($id: ID!) {
    quotationPDF(id: $id)
  }
`;

export { GET_QUOTATIONS, GET_PDF };
