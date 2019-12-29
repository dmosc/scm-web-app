import {gql} from 'apollo-boost';

const EDIT_CLIENT = gql`
  mutation clientEdit($client: ClientEditInput!) {
    clientEdit(client: $client) {
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

export {EDIT_CLIENT};
