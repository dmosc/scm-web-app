import { gql } from 'apollo-boost';

const GET_BILLS = gql`
  query bills($filters: BillFilters!) {
    bills(filters: $filters) {
      id
      date
      folio
      client {
        businessName
      }
      tax
      total
      creditDays
      bill
    }
  }
`;

const GET_PDF = gql`
  query billPDF($id: ID!) {
    billPDF(id: $id)
  }
`;

export { GET_BILLS, GET_PDF };
