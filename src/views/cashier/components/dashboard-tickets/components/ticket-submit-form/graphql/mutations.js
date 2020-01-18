import {gql} from 'apollo-boost';

const TICKET_SUBMIT = gql`
  mutation ticketSubmit($ticket: TicketSubmitInput!) {
    ticketSubmit(ticket: $ticket) {
      id
      driver
      credit
      weight
      totalWeight
      totalPrice
      outTruckImage
    }
  }
`;

export {TICKET_SUBMIT};
