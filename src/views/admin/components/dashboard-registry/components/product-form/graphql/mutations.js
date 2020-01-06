import {gql} from 'apollo-boost';

const EDIT_ROCK = gql`
  mutation rockEdit($rock: RockEditInput!) {
    rockEdit(rock: $rock) {
      id
      name
      price
    }
  }
`;

export {EDIT_ROCK};
