import { gql } from 'apollo-boost';

const UPDATE_EXCLUSION = gql`
  mutation ticketExcludeFromTimeMetrics($tickets: [ID!]!, $exclude: Boolean!) {
    ticketExcludeFromTimeMetrics(tickets: $tickets, exclude: $exclude)
  }
`;

export { UPDATE_EXCLUSION };
