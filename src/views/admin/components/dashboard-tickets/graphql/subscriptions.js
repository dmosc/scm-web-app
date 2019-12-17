import {gql} from 'apollo-boost';

const NEW_TICKET = gql`
  subscription newTicket {
    newTicket {
      folio
    }
  }
`;

export {NEW_TICKET};
