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

export { EDIT_CLIENT };
