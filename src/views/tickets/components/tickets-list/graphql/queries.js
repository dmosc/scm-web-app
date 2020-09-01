import { gql } from 'apollo-boost';

const GET_TICKETS = gql`
  query activeTickets($filters: TicketFilters!) {
    activeTickets(filters: $filters) {
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
      promotion {
        id
        name
        product {
          price
        }
      }
      turn {
        id
      }
      weight
      totalWeight
      totalPrice
      inTruckImage
      inTruckImageLeft
      inTruckImageRight
      outTruckImage
      outTruckImageBack
    }
  }
`;

const GET_PRODUCT_RATE = gql`
  query productRate {
    productRate {
      id
      rate
    }
  }
`;

export { GET_TICKETS, GET_PRODUCT_RATE };
