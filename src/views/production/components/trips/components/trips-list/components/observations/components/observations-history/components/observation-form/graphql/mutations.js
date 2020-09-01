import { gql } from 'apollo-boost';

const INIT_OBSERVATION = gql`
  mutation observationInit($observation: ObservationInitInput!) {
    observationInit(observation: $observation) {
      id
      start
    }
  }
`;

const END_OBSERVATION = gql`
  mutation observationEnd($observation: ObservationEndInput!) {
    observationEnd(observation: $observation) {
      id
      start
      end
      description
    }
  }
`;

export { INIT_OBSERVATION, END_OBSERVATION };
