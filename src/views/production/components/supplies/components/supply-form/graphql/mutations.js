import { gql } from 'apollo-boost';

const NEW_SUPPLY = gql`
  mutation supply($supply: SupplyInput!) {
    supply(supply: $supply) {
      id
      name
      type
      unit
      quantity
    }
  }
`;

const EDIT_SUPPLY = gql`
  mutation supplyEdit($supply: SupplyEditInput!) {
    supplyEdit(supply: $supply) {
      id
      name
      type
      unit
      quantity
    }
  }
`;

export { NEW_SUPPLY, EDIT_SUPPLY };
