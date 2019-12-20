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

export {REGISTER_CLIENT};
