import { gql } from 'apollo-boost';

const GET_BILL_SUMMARY = gql`
  query ticketsToBillSummary($tickets: [ID!]!) {
    ticketsToBillSummary(tickets: $tickets) {
      products {
        product {
          name
        }
        total
      }
      subtotal
      tax
      total
    }
  }
`;

export { GET_BILL_SUMMARY };
