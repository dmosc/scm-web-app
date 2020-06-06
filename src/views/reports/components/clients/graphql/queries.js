import { gql } from 'apollo-boost';

const GET_CLIENTS = gql`
  query clients($filters: ClientFilters!) {
    clients(filters: $filters) {
      id
      businessName
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

const GET_SUMMARY = gql`
  query clientsSummary(
    $clientIds: [ID]!
    $range: DateRange
    $turnId: ID
    $billType: TicketBillType
  ) {
    clientsSummary(clientIds: $clientIds, range: $range, turnId: $turnId, billType: $billType) {
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
      upfrontWeight
      creditWeight
    }
  }
`;

const GET_SUMMARY_XLS = gql`
  query clientsSummaryXLS(
    $clientIds: [ID]!
    $range: DateRange
    $turnId: ID
    $billType: TicketBillType
  ) {
    clientsSummaryXLS(clientIds: $clientIds, range: $range, turnId: $turnId, billType: $billType)
  }
`;

export { GET_TURNS, GET_CLIENTS, GET_SUMMARY, GET_SUMMARY_XLS };
