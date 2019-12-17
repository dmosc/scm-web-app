import {gql} from 'apollo-boost';

const REGISTER_TRUCK = gql`
  mutation truck($truck: TruckInput!) {
    truck(truck: $truck) {
      id
      plates
    }
  }
`;

export {REGISTER_TRUCK};
