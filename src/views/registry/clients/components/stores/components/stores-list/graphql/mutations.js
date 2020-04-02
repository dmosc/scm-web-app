import { gql } from 'apollo-boost';

const DELETE_STORE = gql`
  mutation storeDelete($id: ID!) {
    storeDelete(id: $id)
  }
`;

export { DELETE_STORE };
