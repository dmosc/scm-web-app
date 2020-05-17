import { gql } from 'apollo-boost';

const GET_SALES_AUXILIARY = gql`
  query ticketsAuxiliarySalesXLS($month: Date, $workingDays: Int!, $workingDaysPassed: Int!) {
    ticketsAuxiliarySalesXLS(
      month: $month
      workingDays: $workingDays
      workingDaysPassed: $workingDaysPassed
    )
  }
`;

export { GET_SALES_AUXILIARY };
