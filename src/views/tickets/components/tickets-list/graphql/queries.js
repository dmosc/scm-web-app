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

export { GET_TICKETS };
