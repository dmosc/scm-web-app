import { gql } from 'apollo-boost';

const DELETE_BORE_HOLE = gql`
  mutation boreHoleDelete($id: ID!) {
    boreHoleDelete(id: $id)
  }
`;

export { DELETE_BORE_HOLE };
