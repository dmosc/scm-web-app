import { gql } from 'apollo-boost';

const PRODUCTION_TURN_UPDATE = gql`
  subscription productionTurnUpdate {
    productionTurnUpdate {
      id
      folio
      start
      end
      laps {
        id
        start
        end
        tons
      }
    }
  }
`;

export { PRODUCTION_TURN_UPDATE };
