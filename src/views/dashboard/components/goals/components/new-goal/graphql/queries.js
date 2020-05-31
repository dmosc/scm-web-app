import { gql } from 'apollo-boost';

const GET_ROCKS = gql`
  query rocks($filters: RockFilters!) {
    rocks(filters: $filters) {
      id
      name
      price
      color
    }
  }
`;

const GET_GOAL_SUMMARY = gql`
  query goalSummary($id: ID!) {
    goalSummary(id: $id) {
      goal {
        id
        name
        rocks {
          id
          name
        }
        period
        tons
        start
        end
      }
      tons
      total
    }
  }
`;

export { GET_ROCKS, GET_GOAL_SUMMARY };
