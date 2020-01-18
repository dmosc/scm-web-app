import {gql} from 'apollo-boost';

const GET_TRUCK_DRIVERS = gql`
  query truck($id: ID!) {
    truck(id: $id) {
      drivers
    }
  }
`;

export {GET_TRUCK_DRIVERS};
