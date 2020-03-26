import gql from 'graphql-tag';

const CREATE_CREDIT_LIMIT = gql`
  mutation clientCreditLimit($clientCreditLimit: ClientCreditLimitInput) {
    clientCreditLimit(clientCreditLimit: $clientCreditLimit) {
      id
    }
  }
`;

const ADD_TO_BALANCE = gql`
  mutation clientAddToBalance($client: ID!, $toAdd: Float!) {
    clientAddToBalance(client: $client, toAdd: $toAdd) {
      id
    }
  }
`;

export { CREATE_CREDIT_LIMIT, ADD_TO_BALANCE };
