import { gql } from 'apollo-boost';

const GET_DELETED_USERS = gql`
  query deletedUsers {
    deletedUsers {
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

export { GET_DELETED_USERS };
