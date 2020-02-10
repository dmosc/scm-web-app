import { gql } from 'apollo-boost';

const ADD_TICKET_TO_TURN = gql`
  mutation turnAddTicket($turn: TurnAddTicket!) {
    turnAddTicket(turn: $turn) {
      id
      start
      end
      period
      folios
    }
  }
`;

export { ADD_TICKET_TO_TURN };
