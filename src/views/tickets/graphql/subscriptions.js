import { gql } from 'apollo-boost';

const TURN_UPDATE = gql`
  subscription ticketUpdate {
    turnUpdate {
      id
      start
      end
      period
      folios
      uniqueId
    }
  }
`;

export { TURN_UPDATE };
