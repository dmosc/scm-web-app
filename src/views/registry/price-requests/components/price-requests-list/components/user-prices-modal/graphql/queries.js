import { gql } from 'apollo-boost';

const GET_CLIENT = gql`
  query client($id: ID!) {
    client(id: $id) {
      id
      businessName
      prices {
        rock {
          id
          name
        }
        price
      }
    }
  }
`;

export { GET_CLIENT };
