import {gql} from 'apollo-boost';

const GET_TICKETS = gql`
  query tickets($filters: TicketFilters!) {
    tickets(filters: $filters) {
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
      weight
      totalWeight
      totalPrice
      inTruckImage
      outTruckImage
    }
  }
`;

export {GET_TICKETS};
