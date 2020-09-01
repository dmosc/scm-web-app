import { gql } from 'apollo-boost';

const DELETE_POST = gql`
  mutation postDelete($id: ID!) {
    postDelete(id: $id)
  }
`;

export { DELETE_POST };
