import gql from 'graphql-tag';

const ADD_SPECIAL_PRICE = gql`
  mutation clientPrice($clientPrice: ClientPriceInput!) {
    clientPrice(clientPrice: $clientPrice) {
      id
    }
  }
`;

export { ADD_SPECIAL_PRICE };
