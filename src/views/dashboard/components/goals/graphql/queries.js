import { gql } from 'apollo-boost';

const GET_GOALS_SUMMARY = gql`
  query goalsSummary {
    goalsSummary {
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

export { GET_GOALS_SUMMARY };
