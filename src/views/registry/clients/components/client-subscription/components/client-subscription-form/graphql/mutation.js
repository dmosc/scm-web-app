import { gql } from 'apollo-boost';

const REGISTER_CLIENT_SUBSCRIPTION = gql`
  mutation clientSubscription($clientSubscription: ClientSubscriptionInput!) {
    clientSubscription(clientSubscription: $clientSubscription) {
      id
    }
  }
`;

export { REGISTER_CLIENT_SUBSCRIPTION };
