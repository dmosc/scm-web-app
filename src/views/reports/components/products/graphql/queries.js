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

const GET_ROCK_SALES = gql`
  query rockSalesReport($filters: RockSalesReportFilters!) {
    rockSalesReport(filters: $filters) {
      rocks {
        rock {
          id
          name
          color
        }
        tickets {
          id
          folio
          totalWeight
          totalPrice
          credit
          bill
        }
        total
      }
      total
    }
  }
`;

const GET_ROCK_MONTH_SALES = gql`
  query rockMonthSalesReport($filters: RockSalesReportFilters!) {
    rockMonthSalesReport(filters: $filters) {
      monthSummary {
        month
        rocks {
          name
          price
          color
          total
        }
        total
      }
    }
  }
`;

const GET_TURNS = gql`
  query turns($filters: TurnFilters!) {
    turns(filters: $filters) {
      id
      start
      end
      uniqueId
      period
      user {
        id
        firstName
        lastName
      }
    }
  }
`;

export { GET_ROCKS, GET_ROCK_SALES, GET_ROCK_MONTH_SALES, GET_TURNS };
