import { gql } from 'apollo-boost';

const ACTIVE_TICKETS = gql`
  subscription activeTickets {
    activeTickets {
      id
      folio
      driver
      credit
      bill
      client {
        id
        firstName
        lastName
        businessName
        address
        zipcode
        rfc
        credit
        prices {
          rock {
            id
            name
          }
          price
        }
      }
      truck {
        id
        plates
        weight
      }
      product {
        id
        name
        price
      }
      turn {
        id
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
        id
        firstName
        lastName
        businessName
        address
        rfc
        credit
        zipcode
        prices {
          rock {
            id
            name
          }
          price
        }
      }
      truck {
        id
        plates
        weight
      }
      product {
        id
        name
        price
      }
      turn {
        id
      }
      weight
      totalWeight
      totalPrice
      inTruckImage
      outTruckImage
    }
  }
`;

export { ACTIVE_TICKETS, TICKET_UPDATE };
