import { gql } from 'apollo-boost';

const RESOLVE_SUBSCRIPTION_WARNING = gql`
  mutation clientSubscriptionWarningResolve(
    $clientSubscriptionWarning: ClientSubscriptionWarningResolve!
  ) {
    clientSubscriptionWarningResolve(clientSubscriptionWarning: $clientSubscriptionWarning) {
      id
      tons
      start
      end
      subscription {
        id
      }
      resolvedBy {
        id
        firstName
        lastName
      }
    }
  }
`;

export { RESOLVE_SUBSCRIPTION_WARNING };
