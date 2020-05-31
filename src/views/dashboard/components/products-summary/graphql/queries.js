import { gql } from 'apollo-boost';

const GET_ROCK_SALES = gql`
  query rockSalesReportInRange($filters: RockSalesReportInRangeFilters!) {
    rockSalesReportInRange(filters: $filters) {
      rocks {
        rock {
          id
          name
          color
        }
        total
        totalWeight
      }
      total
      totalWeight
    }
  }
`;

export { GET_ROCK_SALES };
