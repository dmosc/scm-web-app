import { gql } from 'apollo-boost';

const GET_CLIENT_STORES = gql`
  query stores($client: ID!) {
    stores(client: $client) {
      id
      address
      name
      state
      municipality
    }
  }
`;

export { GET_CLIENT_STORES };
