import { gql } from 'apollo-boost';

const GET_TRACING = gql`
  query clientsTracing($range: DateRange!, $sortBy: ClientTracingSort) {
    clientsTracing(range: $range, sortBy: $sortBy) {
      ticketsQty
      totalWeight
      totalTaxes
      subtotal
      total
      client {
        id
        uniqueId
        businessName
        firstName
        lastName
      }
    }
  }
`;

export { GET_TRACING };
