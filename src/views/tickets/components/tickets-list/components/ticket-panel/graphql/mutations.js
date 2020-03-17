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

const DISABLE_TICKET = gql`
  mutation ticketDisable($id: ID!) {
    ticketDisable(id: $id)
  }
`;

export { ADD_TICKET_TO_TURN, DISABLE_TICKET };
