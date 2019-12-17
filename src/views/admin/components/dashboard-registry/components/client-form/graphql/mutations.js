import {gql} from 'apollo-boost';

const REGISTER_CLIENT = gql`
  mutation client($client: ClientInput!) {
    client(client: $client) {
      businessName
    }
  }
`;

export {REGISTER_CLIENT};
