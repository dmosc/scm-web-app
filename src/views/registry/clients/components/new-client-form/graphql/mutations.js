import { gql } from 'apollo-boost';

const REGISTER_CLIENT = gql`
  mutation client($client: ClientInput!) {
    client(client: $client) {
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

export { REGISTER_CLIENT };
