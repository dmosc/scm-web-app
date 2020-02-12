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

export { GET_TRUCKS };
