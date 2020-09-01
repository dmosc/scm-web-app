import { gql } from 'apollo-boost';

const NEW_BORE_HOLE = gql`
  mutation boreHole($boreHole: BoreHoleInput!) {
    boreHole(boreHole: $boreHole) {
      id
      folio
      date
      meters
      createdAt
      machine {
        name
        model
        type
      }
      createdBy {
        firstName
        lastName
      }
    }
  }
`;

const EDIT_BORE_HOLE = gql`
  mutation boreHoleEdit($boreHole: BoreHoleEditInput!) {
    boreHoleEdit(boreHole: $boreHole) {
      id
      folio
      date
      meters
      createdAt
      machine {
        name
        model
        type
      }
      createdBy {
        firstName
        lastName
      }
    }
  }
`;

export { NEW_BORE_HOLE, EDIT_BORE_HOLE };
