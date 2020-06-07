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
    ticketMaxTime(date: $date, turnId: $turnId, rocks: $rocks)
    ticketMinTime(date: $date, turnId: $turnId, rocks: $rocks)
  }
`;

export { GET_ROCKS, TURN_BY_UNIQUE_ID, GET_MOST_RECENTLY_ENDED_TURN, GET_TURNS, GET_TIMES };
