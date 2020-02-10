import { gql } from 'apollo-boost';

const REGISTER_TRUCK = gql`
  mutation truck($truck: TruckInput!) {
    truck(truck: $truck) {
      id
      plates
      brand
      model
      client {
        businessName
      }
      weight
      drivers
    }
  }
`;

export { REGISTER_TRUCK };
