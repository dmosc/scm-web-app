import { gql } from 'apollo-boost';

const GET_CLIENTS = gql`
  query clients($filters: ClientFilters!) {
    clients(filters: $filters) {
      id
      firstName
      lastName
      email
      role
      businessName
      rfc
      CFDIuse
      cellphone
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
      prices {
        rock {
          id
          name
        }
        price
      }
      credit
    }
  }
`;

export { GET_CLIENTS };
