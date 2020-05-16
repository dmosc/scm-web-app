import { gql } from 'apollo-boost';

const GET_SUBSCRIPTION_WARNING = gql`
  query clientSubscriptionWarning($id: ID!) {
    clientSubscriptionWarning(id: $id) {
      id
      tons
      start
      end
      subscription {
        id
      }
    }
  }
`;

export { GET_SUBSCRIPTION_WARNING };
