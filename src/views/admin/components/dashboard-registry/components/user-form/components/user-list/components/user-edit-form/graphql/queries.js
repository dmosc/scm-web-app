import {gql} from 'apollo-boost';

const GET_USERS = gql`
  query users($filters: UserFilters!) {
    users(filters: $filters) {
      id
      username
      email
      firstName
      lastName
      role
      password
    }
  }
`;

export {GET_USERS};
