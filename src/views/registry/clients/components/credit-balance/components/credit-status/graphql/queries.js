import gql from 'graphql-tag';

const GET_CLIENT_BALANCE = gql`
  query client($id: ID!) {
    client(id: $id) {
      id
      balance
    }
  }
`;

const GET_CREDIT_LIMIT = gql`
  query clientCreditLimit($client: ID!) {
    clientCreditLimit(client: $client) {
      id
      creditLimit
    }
  }
`;

export { GET_CLIENT_BALANCE, GET_CREDIT_LIMIT };
