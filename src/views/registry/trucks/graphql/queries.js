import { gql } from 'apollo-boost';

const GET_TRUCKS = gql`
  query trucks($filters: TruckFilters!) {
    trucks(filters: $filters) {
      id
      plates
      brand
      model
      client {
        id
        businessName
      }
      weight
      drivers
    }
  }
`;

const GET_ENCRYPTED_PLATES = gql`
  query truckQRCode($id: ID) {
    truckQRCode(id: $id)
  }
`;

export { GET_TRUCKS, GET_ENCRYPTED_PLATES };
