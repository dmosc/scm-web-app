import { gql } from 'apollo-boost';

const GET_MACHINE_DIESEL_LOADS = gql`
  query machineDieselLoads($filters: MachineDieselLoadFilters!) {
    machineDieselLoads(filters: $filters) {
      id
      date
      previousTankIndicator
      tankIndicator
      horometer
      driver
      machine {
        id
        name
      }
      registeredBy {
        id
        firstName
        lastName
      }
    }
  }
`;

export { GET_MACHINE_DIESEL_LOADS };
