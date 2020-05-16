import { gql } from 'apollo-boost';

const GET_CLIENT_SUBSCRIPTIONS = gql`
  query clientSubscriptions($filters: ClientSubscriptionFilters!) {
    clientSubscriptions(filters: $filters) {
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
        cellphone
        email
      }
    }
  }
`;

const GET_SUBSCRIPTION_WARNING_COUNT = gql`
  query clientSubscriptionWarningCount {
    clientSubscriptionWarningCount
  }
`;

export { GET_CLIENT_SUBSCRIPTIONS, GET_SUBSCRIPTION_WARNING_COUNT };
