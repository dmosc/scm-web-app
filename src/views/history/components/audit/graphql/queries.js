import { gql } from 'apollo-boost';

const GET_TICKET = gql`
  query ticket($id: ID!) {
    ticket(id: $id) {
      id
      folio
      driver
      client {
        id
        businessName
        firstName
        lastName
        rfc
        cellphone
      }
      truck {
        id
        plates
        brand
        model
        weight
      }
      product {
        id
        name
      }
      store {
        id
        address
        name
        state
        municipality
      }
      promotion {
        id
        name
      }
      tax
      weight
      totalWeight
      totalPrice
      credit
      in
      out
      load
      inTruckImage
      inTruckImageLeft
      inTruckImageRight
      outTruckImage
      outTruckImageBack
      bill
      isBilled
      usersInvolved {
        guard {
          id
          firstName
          lastName
          username
        }
        loader {
          id
          firstName
          lastName
          username
        }
        cashier {
          id
          firstName
          lastName
          username
        }
      }
      turn {
        id
        user {
          id
          firstName
          lastName
        }
        period
        start
        end
      }
      withScale
    }
  }
`;

export { GET_TICKET };
