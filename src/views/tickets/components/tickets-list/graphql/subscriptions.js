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
        stores {
          id
          name
        }
        address {
          country
          state
          municipality
          city
          suburb
          street
          extNumber
          intNumber
          zipcode
        }
        rfc
        balance
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
      store {
        id
        name
        address
        municipality
        state
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
        stores {
          id
          name
        }
        address {
          country
          state
          municipality
          city
          suburb
          street
          extNumber
          intNumber
          zipcode
        }
        rfc
        balance
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
      store {
        id
        name
        address
        municipality
        state
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
