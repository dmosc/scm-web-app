import { gql } from 'apollo-boost';

// This is because the three queries using this type are intimately related
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

const GET_TICKET_TIMES = gql`
  query ticketTimesSummary($date: DateRange, $turnId: ID, $rocks: [ID], $folioSearch: String) {
    ticketTimesSummary(date: $date, turnId: $turnId, rocks: $rocks, folioSearch: $folioSearch) {
      id
      folio
      excludeFromTimeMetrics
      client {
        id
        businessName
      }
      truck {
        id
        plates
      }
      product {
        id
        name
      }
      time
    }
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

const GET_TIMES = gql`
  query times($date: DateRange, $turnId: ID, $rocks: [ID]) {
    ticketTimes(date: $date, turnId: $turnId, rocks: $rocks) {
      max
      min
      avg
    }
  }
`;

const GET_TIMES_XLS = gql`
  query times($date: DateRange, $turnId: ID, $rocks: [ID]) {
    ticketTimesXLS(date: $date, turnId: $turnId, rocks: $rocks)
  }
`;

export { GET_ROCKS, TURN_BY_UNIQUE_ID, GET_TURNS, GET_TIMES, GET_TIMES_XLS, GET_TICKET_TIMES };
