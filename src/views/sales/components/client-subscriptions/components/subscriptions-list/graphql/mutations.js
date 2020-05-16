import { gql } from 'apollo-boost';

const DELETE_CLIENT_SUBSCRIPTION = gql`
  mutation clientSubscriptionDelete($id: ID!) {
    clientSubscriptionDelete(id: $id)
  }
`;

export { DELETE_CLIENT_SUBSCRIPTION };
