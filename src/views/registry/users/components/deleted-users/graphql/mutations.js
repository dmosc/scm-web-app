import { gql } from 'apollo-boost';

const RESTORE_USER = gql`
  mutation userRestore($id: ID!) {
    userRestore(id: $id)
  }
`;

export { RESTORE_USER };
