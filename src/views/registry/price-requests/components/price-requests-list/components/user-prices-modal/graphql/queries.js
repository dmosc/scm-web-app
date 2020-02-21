import { gql } from 'apollo-boost';

const GET_CLIENT = gql`
  query client($id: ID!) {
    client(id: $id) {
      id
      businessName
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
    }
  }
`;

export { GET_CLIENT };
