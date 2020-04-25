import { gql } from 'apollo-boost';

const TURN_ACTIVE = gql`
  query turnActive {
    turnActive {
      id
      start
      end
      period
      folios
      uniqueId
    }
  }
`;

const GET_TICKET_PROMOTIONS = gql`
  query promotionsForTicket($ticket: ID!) {
    promotionsForTicket(ticket: $ticket) {
      id
      name
      credit
      bill
      product {
        price
      }
    }
  }
`;

export { TURN_ACTIVE, GET_TICKET_PROMOTIONS };
