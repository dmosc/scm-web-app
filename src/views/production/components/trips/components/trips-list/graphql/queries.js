import { gql } from 'apollo-boost';

const GET_LAP_ACTIVE = gql`
  query lapActive {
    lapActive {
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

const GET_ACTIVE_LAPS = gql`
  query activeLaps {
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

export { GET_LAP_ACTIVE, GET_ACTIVE_LAPS };
