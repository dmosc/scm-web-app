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

export { GET_BILLS };
