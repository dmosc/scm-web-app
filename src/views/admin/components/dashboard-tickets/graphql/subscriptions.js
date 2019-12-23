import {gql} from 'apollo-boost';

const NEW_TICKET = gql`
  subscription newTicket {
    newTicket {
      id
      folio
      driver
      client {
        firstName
        lastName
        businessName
        address
        rfc
      }
      truck {
        plates
        weight
      }
      product {
        name
        price
      }
      inTruckImage
    }
  }
`;

const TICKET_UPDATE = gql`
  subscription ticketUpdate {
    ticketUpdate {
      id
      driver
      weight
      totalWeight
      totalPrice
      outTruckImage
    }
  }
`;

export {NEW_TICKET, TICKET_UPDATE};
