import {gql} from 'apollo-boost';

const NEW_TICKET = gql`
  subscription newTicket {
    newTicket {
      id
      folio
      driver
      credit
      bill
      client {
        firstName
        lastName
        businessName
        address
        rfc
        credit
        prices {
          A4B
          A4D
          A5
          BASE
          CNC
          G2
          MIX
          SUBBASE
          SELLO
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
      bill
      client {
        firstName
        lastName
        businessName
        address
        rfc
        credit
        prices {
          A4B
          A4D
          A5
          BASE
          CNC
          G2
          MIX
          SUBBASE
          SELLO
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
