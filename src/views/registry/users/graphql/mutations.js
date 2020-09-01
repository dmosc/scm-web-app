import { gql } from 'apollo-boost';

const DELETE_USER = gql`
  mutation userDelete($id: ID!) {
    userDelete(id: $id)
  }
`;

export { DELETE_USER };
