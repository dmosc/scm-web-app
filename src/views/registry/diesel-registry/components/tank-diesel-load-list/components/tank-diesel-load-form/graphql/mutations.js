import { gql } from 'apollo-boost';

const REGISTER_TANK_DIESEL_LOAD = gql`
  mutation tankDieselLoad($tankDieselLoad: TankDieselLoadInput!) {
    tankDieselLoad(tankDieselLoad: $tankDieselLoad) {
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

export { REGISTER_TANK_DIESEL_LOAD };
