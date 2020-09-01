import { gql } from 'apollo-boost';

const DELETE_BILL = gql`
  mutation billDelete($id: ID!) {
    billDelete(id: $id)
  }
`;

export { DELETE_BILL };
