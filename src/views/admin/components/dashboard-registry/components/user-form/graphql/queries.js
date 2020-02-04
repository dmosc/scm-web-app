import { gql } from 'apollo-boost';

const GET_USERS = gql`
  query users($filters: UserFilters!) {
    users(filters: $filters) {
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

export { GET_USERS };
