import { gql } from 'apollo-boost';

const GET_BILL_SUMMARY = gql`
  query ticketsToBillSummary($tickets: [ID!]!, $client: ID!) {
    ticketsToBillSummary(tickets: $tickets, client: $client) {
      products {
        product {
          name
        }
        price
        weight
        total
      }
      subtotal
      tax
      total
    }
  }
`;

const GET_CLIENT = gql`
  query client($id: ID!) {
    client(id: $id) {
      defaultCreditDays
      stores {
        id
        name
      }
    }
  }
`;

export { GET_BILL_SUMMARY, GET_CLIENT };
