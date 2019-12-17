import {gql} from 'apollo-boost';

const GET_CLIENTS = gql`
  query clients($filters: ClientFilters!) {
    clients(filters: $filters) {
      id
      firstName
      lastName
      businessName
    }
  }
`;

export {GET_CLIENTS};
