import { gql } from 'apollo-boost';

const REGISTER_MACHINE_DIESEL_LOAD = gql`
  mutation machineDieselLoad($machineDieselLoad: MachineDieselLoadInput!) {
    machineDieselLoad(machineDieselLoad: $machineDieselLoad) {
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

export { REGISTER_MACHINE_DIESEL_LOAD };
