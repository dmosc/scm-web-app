import { gql } from 'apollo-boost';

// This is beacause the three queries using this type are intimately related
// This will enforce consistency between them
const turnData = `
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
`;

const GET_TURNS = gql`
  query turns($filters: TurnFilters!) {
    turns(filters: $filters) {
      ${turnData}
    }
  }
`;

const TURN_BY_UNIQUE_ID = gql`
  query turnByUniqueId($uniqueId: Int!) {
    turnByUniqueId(uniqueId: $uniqueId) {
      ${turnData}
    }
  }
`;

const GET_MOST_RECENTLY_ENDED_TURN = gql`
  query turnMostRecentlyEnded {
    turnMostRecentlyEnded {
      ${turnData}
    }
  }
`;

const GET_REPORT = gql`
  query turnSummaryXLS($uniqueId: Int!, $ticketType: TicketPaymentType) {
    turnSummaryXLS(uniqueId: $uniqueId, ticketType: $ticketType)
  }
`;

const GET_TURN_SUMMARY = gql`
  query turnSummary($uniqueId: Int!, $ticketType: TicketPaymentType) {
    turnSummary(uniqueId: $uniqueId, ticketType: $ticketType) {
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

export { GET_REPORT, GET_TURN_SUMMARY, GET_MOST_RECENTLY_ENDED_TURN, TURN_BY_UNIQUE_ID, GET_TURNS };
