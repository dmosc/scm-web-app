import { gql } from 'apollo-boost';

const GET_QUOTATIONS = gql`
  query quotations($filters: QuotationFilters!) {
    quotations(filters: $filters) {
      id
      name
      businessName
      createdAt
      validUntil
      folio
      hasFreight
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
        freight
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
