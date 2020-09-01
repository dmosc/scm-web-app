import { gql } from 'apollo-boost';

const DELETE_SUPPLY_TRANSACTION_OUT = gql`
  mutation supplyTransactionOutDelete($id: ID!) {
    supplyTransactionOutDelete(id: $id)
  }
`;

const DELETE_SUPPLY_TRANSACTION_IN = gql`
  mutation supplyTransactionInDelete($id: ID!) {
    supplyTransactionInDelete(id: $id)
  }
`;

export { DELETE_SUPPLY_TRANSACTION_OUT, DELETE_SUPPLY_TRANSACTION_IN };
