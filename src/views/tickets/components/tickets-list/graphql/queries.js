import { gql } from 'apollo-boost';

const GET_TICKETS = gql`
  query tickets($filters: TicketFilters!) {
    tickets(filters: $filters) {
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
