import { gql } from 'apollo-boost';

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
        A4B
        A4D
        A5
        BASE
        CNC
        G2
        MIX
        SUBBASE
        SELLO
      }
      credit
    }
  }
`;

export { EDIT_CLIENT };
