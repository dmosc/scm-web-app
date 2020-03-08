import { gql } from 'apollo-boost';

const GET_ACTIVE_TICKETS = gql`
  query notLoadedActiveTickets($filters: TicketFilters!) {
    notLoadedActiveTickets(filters: $filters) {
      id
      folio
      client {
        id
        businessName
      }
      truck {
        id
        plates
      }
      product {
        id
        name
      }
    }
  }
`;

const GET_ROCKS = gql`
  query rocks($filters: RockFilters!) {
    rocks(filters: $filters) {
      id
      name
      price
      color
    }
  }
`;

export { GET_ACTIVE_TICKETS, GET_ROCKS };
