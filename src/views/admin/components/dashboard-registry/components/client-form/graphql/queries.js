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
        A1
        A2
        A3
        A4
        A5
        A6
        A7
      }
      credit
      bill
    }
  }
`;

export {GET_CLIENTS};
