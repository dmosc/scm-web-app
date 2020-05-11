import { gql } from 'apollo-boost';

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

const GET_SUMMARY = gql`
  query ticketsSummary(
    $range: DateRange
    $turnId: ID
    $billType: TicketBillType
    $paymentType: TicketPaymentType
  ) {
    ticketsSummary(range: $range, turnId: $turnId, billType: $billType, paymentType: $paymentType) {
      clients {
        info {
          id
          businessName
        }
        count
        tickets {
          id
          folio
          driver
          tax
          weight
          totalWeight
          totalPrice
          credit
          inTruckImage
          outTruckImage
        }
      }
      upfront
      credit
      total
    }
  }
`;

const GET_SUMMARY_BY_CLIENT_XLS = gql`
  query ticketsSummaryByClientXLS(
    $range: DateRange
    $turnId: ID
    $billType: TicketBillType
    $paymentType: TicketPaymentType
  ) {
    ticketsSummaryByClientXLS(
      range: $range
      turnId: $turnId
      billType: $billType
      paymentType: $paymentType
    )
  }
`;

const GET_SUMMARY_BY_DATE_XLS = gql`
  query ticketsSummaryByDateXLS(
    $range: DateRange
    $turnId: ID
    $billType: TicketBillType
    $paymentType: TicketPaymentType
  ) {
    ticketsSummaryByDateXLS(
      range: $range
      turnId: $turnId
      billType: $billType
      paymentType: $paymentType
    )
  }
`;

export { GET_TURNS, GET_SUMMARY, GET_SUMMARY_BY_CLIENT_XLS, GET_SUMMARY_BY_DATE_XLS };
