import { gql } from 'apollo-boost';

const GET_DAILY_TRACING = gql`
  query clientTracingDaily($clientId: ID!, $range: DateRange) {
    clientTracingDaily(clientId: $clientId, range: $range) {
      ticketsQty
      totalWeight
      totalTaxes
      subtotal
      total
      date
    }
  }
`;

export { GET_DAILY_TRACING };
