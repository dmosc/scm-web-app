import { gql } from 'apollo-boost';

const EDIT_CLIENT_SUBSCRIPTION = gql`
  mutation clientSubscriptionEdit($clientSubscription: ClientSubscriptionEditInput!) {
    clientSubscriptionEdit(clientSubscription: $clientSubscription) {
      id
      days
      tons
      margin
      start
      end
      isWarningActive
      requestedBy {
        id
        firstName
        lastName
      }
      client {
        id
        businessName
      }
    }
  }
`;

export { EDIT_CLIENT_SUBSCRIPTION };
