import {gql} from 'apollo-boost';

const GET_TICKETS = gql`
  query tickets($filters: TicketFilters!) {
    tickets(filters: $filters) {
      folio
    }
  }
`;

export {GET_TICKETS};
