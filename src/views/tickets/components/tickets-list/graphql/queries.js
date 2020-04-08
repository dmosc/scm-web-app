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

export { GET_TICKETS };
