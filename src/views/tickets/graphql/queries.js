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

const GET_PDF = gql`
  query ticketPDF($idOrFolio: String!) {
    ticketPDF(idOrFolio: $idOrFolio)
  }
`;

export { TURN_ACTIVE, GET_TICKET_PROMOTIONS, GET_PDF };
