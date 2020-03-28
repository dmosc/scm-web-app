import gql from 'graphql-tag';

const GET_DEPOSIT_HISTORY = gql`
  query client($id: ID!) {
    client(id: $id) {
      id
      depositHistory {
        depositedAt
        amount
        depositedBy {
          id
          firstName
          lastName
        }
        newBalance
      }
    }
  }
`;

export { GET_DEPOSIT_HISTORY };
