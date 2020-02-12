import { gql } from 'apollo-boost';

const INIT_TURN = gql`
  mutation turnInit($turn: TurnInitInput!) {
    turnInit(turn: $turn) {
      id
      start
      end
      period
    }
  }
`;

export { INIT_TURN };
