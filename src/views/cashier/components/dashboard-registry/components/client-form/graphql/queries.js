import {gql} from 'apollo-boost';

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
      address
      prices {
        N4B
        N4D
        N5
        BASE
        CNC
        GRAVA2
        MIXTO
      }
      credit
      bill
    }
  }
`;

const GET_PRODUCTS = gql`
  query rocks($filters: RockFilters!) {
    rocks(filters: $filters) {
      name
      price
    }
  }
`;

export {GET_CLIENTS, GET_PRODUCTS};
