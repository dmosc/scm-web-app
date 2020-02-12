import { gql } from 'apollo-boost';

const DELETE_TRUCK = gql`
  mutation truckDelete($id: ID!) {
    truckDelete(id: $id)
  }
`;

export { DELETE_TRUCK };
