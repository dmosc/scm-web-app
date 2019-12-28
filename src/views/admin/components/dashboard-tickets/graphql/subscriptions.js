import {gql} from 'apollo-boost';

const NEW_TICKET = gql`
  subscription newTicket {
    newTicket {
      id
      folio
      driver
      credit
      client {
        firstName
        lastName
        businessName
        address
        rfc
        credit
        prices {
          N4B
          N4D
          N5
          BASE
          CNC
          GRAVA2
          MIXTO
        }
      }
      truck {
        id
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
      client {
        firstName
        lastName
        businessName
        address
        rfc
        credit
        bill
        prices {
          N4B
          N4D
          N5
          BASE
          CNC
          GRAVA2
          MIXTO
        }
      }
    }
  }
`;

export {NEW_TICKET, TICKET_UPDATE};
