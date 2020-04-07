import { gql } from 'apollo-boost';

const GET_TANK_DIESEL_LOADS = gql`
  query tankDieselLoads($filters: TankDieselLoadFilters!) {
    tankDieselLoads(filters: $filters) {
      id
      date
      tankIndicator
      load
      reference
      comments
      registeredBy {
        id
        firstName
        lastName
      }
    }
  }
`;

export { GET_TANK_DIESEL_LOADS };
