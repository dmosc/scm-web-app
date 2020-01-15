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
      truck {
        id
        plates
        weight
      }
      product {
        name
        price
      }
      weight
      totalWeight
      totalPrice
      inTruckImage
      outTruckImage
    }
  }
`;

const TICKET_UPDATE = gql`
  subscription ticketUpdate {
    ticketUpdate {
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
      truck {
        id
        plates
        weight
      }
      product {
        name
        price
      }
      weight
      totalWeight
      totalPrice
      inTruckImage
      outTruckImage
    }
  }
`;

const TURN_UPDATE = gql`
    subscription ticketUpdate {
      turnUpdate {
        id
        start
        end
        period
      }
    }
`;

export {NEW_TICKET, TICKET_UPDATE, TURN_UPDATE};
