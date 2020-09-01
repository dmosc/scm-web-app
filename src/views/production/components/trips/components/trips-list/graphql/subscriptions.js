import { gql } from 'apollo-boost';

const ACTIVE_LAPS = gql`
  subscription activeLaps {
    activeLaps {
      id
      start
      tons
      driver {
        id
        firstName
        lastName
      }
      machine {
        id
        name
        type
      }
      observations {
        id
        start
        end
        description
      }
    }
  }
`;

export { ACTIVE_LAPS };
