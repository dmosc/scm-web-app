import { gql } from 'apollo-boost';

const DELETE_GOAL = gql`
  mutation goalDelete($id: ID!) {
    goalDelete(id: $id)
  }
`;

export { DELETE_GOAL };
