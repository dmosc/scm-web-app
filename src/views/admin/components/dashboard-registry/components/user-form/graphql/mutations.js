import { gql } from 'apollo-boost';

const REGISTER_USER = gql`
  mutation user($user: UserRegisterInput!) {
    user(user: $user) {
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

export { REGISTER_USER };
