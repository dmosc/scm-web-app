import gql from 'graphql-tag';

const GET_CREDIT_HISTORY = gql`
  query clientCreditLimitHistory($client: ID!) {
    clientCreditLimitHistory(client: $client) {
      id
      creditLimit
      addedAt
      setBy {
        id
        firstName
        lastName
      }
    }
  }
`;

export { GET_CREDIT_HISTORY };
