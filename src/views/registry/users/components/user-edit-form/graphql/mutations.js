import { gql } from 'apollo-boost';

const EDIT_USER = gql`
  mutation userEdit($user: UserEditInput!) {
    userEdit(user: $user) {
      id
      firstName
      lastName
      email
      username
      role
      password
    }
  }
`;

export { EDIT_USER };
