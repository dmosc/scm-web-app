import { gql } from 'apollo-boost';

const REGISTER_GOAL = gql`
  mutation goal($goal: GoalInput!) {
    goal(goal: $goal) {
      id
    }
  }
`;

export { REGISTER_GOAL };
