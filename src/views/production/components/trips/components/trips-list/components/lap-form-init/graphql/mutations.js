import { gql } from 'apollo-boost';

const INIT_LAP = gql`
  mutation lapInit($lap: LapInitInput!) {
    lapInit(lap: $lap) {
      id
      start
      tons
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

export { INIT_LAP };
