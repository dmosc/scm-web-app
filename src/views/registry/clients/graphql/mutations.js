import { gql } from 'apollo-boost';

const DELETE_CLIENT = gql`
  mutation clientDelete($id: ID!) {
    clientDelete(id: $id)
  }
`;

export { DELETE_CLIENT };
