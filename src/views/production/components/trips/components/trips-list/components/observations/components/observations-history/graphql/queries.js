import { gql } from 'apollo-boost';

const GET_OBSERVATION_ACTIVE = gql`
  query observationActive($lap: ID!) {
    observationActive(lap: $lap) {
      id
      start
    }
  }
`;

export { GET_OBSERVATION_ACTIVE };
