import {gql} from 'apollo-boost';

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

export {REGISTER_CLIENT};
