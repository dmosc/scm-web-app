import { gql } from 'apollo-boost';

const GET_SALES_AUXILIARY = gql`
  query ticketsAuxiliarySalesXLS(
    $month: Date
    $workingDays: Int!
    $workingDaysPassed: Int!
    $excluded: [ID]
  ) {
    ticketsAuxiliarySalesXLS(
      month: $month
      workingDays: $workingDays
      workingDaysPassed: $workingDaysPassed
      excluded: $excluded
    )
  }
`;

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

export { GET_SALES_AUXILIARY, GET_ROCKS };
