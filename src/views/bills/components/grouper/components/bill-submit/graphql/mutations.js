import { gql } from 'apollo-boost';

const REGISTER_BILL = gql`
  mutation bill($bill: BillInput!) {
    bill(bill: $bill) {
      folio
      client {
        id
        businessName
      }
    }
  }
`;

export { REGISTER_BILL };
