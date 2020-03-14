import { gql } from 'apollo-boost';

const TURN_UPDATE = gql`
  subscription ticketUpdate {
    turnUpdate {
      id
      start
      end
      period
      folios
    }
  }
`;

export { TURN_UPDATE };
