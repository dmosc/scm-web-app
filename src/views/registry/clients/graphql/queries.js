import { gql } from 'apollo-boost';

const GET_CLIENTS = gql`
  query clients($filters: ClientFilters!) {
    clients(filters: $filters) {
      id
      uniqueId
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
      balance
    }
  }
`;

export { GET_CLIENTS };
