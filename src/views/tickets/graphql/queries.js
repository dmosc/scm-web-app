import { gql } from 'apollo-boost';

const TURN_ACTIVE = gql`
  query turnActive {
    turnActive {
      id
      start
      end
      period
      folios
      uniqueId
    }
  }
`;

export { TURN_ACTIVE };
