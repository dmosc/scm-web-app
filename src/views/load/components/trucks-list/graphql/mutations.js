import { gql } from 'apollo-boost';

const EDIT_TICKET = gql`
  mutation ticketEdit($ticket: TicketEditInput!) {
    ticketEdit(ticket: $ticket) {
      id
      folio
      client {
        id
        businessName
      }
      truck {
        id
        plates
      }
      product {
        id
        name
      }
    }
  }
`;

const PRODUCT_LOAD_TICKET = gql`
  mutation productLoadTicketSetDate($ticket: TicketEditInput!) {
    ticketProductLoadSetDate(ticket: $ticket) {
      id
      folio
      client {
        id
        businessName
      }
      truck {
        id
        plates
      }
      product {
        id
        name
      }
    }
  }
`;

export { EDIT_TICKET, PRODUCT_LOAD_TICKET };
