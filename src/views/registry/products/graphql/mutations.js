import { gql } from 'apollo-boost';

const DELETE_PRODUCT = gql`
  mutation rockDelete($id: ID!) {
    rockDelete(id: $id)
  }
`;

export { DELETE_PRODUCT };
