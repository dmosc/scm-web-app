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

const SET_STORE_TO_TICKET = gql`
  mutation ticketSetStore($ticket: ID!, $store: ID) {
    ticketSetStore(ticket: $ticket, store: $store)
  }
`;

const DISABLE_TICKET = gql`
  mutation ticketDisable($id: ID!) {
    ticketDisable(id: $id)
  }
`;

export { ADD_TICKET_TO_TURN, SET_STORE_TO_TICKET, DISABLE_TICKET };
