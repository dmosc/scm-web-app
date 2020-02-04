import { gql } from 'apollo-boost';

const END_TURN = gql`
  mutation turnEnd($turn: TurnEndInput!) {
    turnEnd(turn: $turn) {
      id
      start
      end
      period
    }
  }
`;

export { END_TURN };
