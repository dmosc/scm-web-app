import { gql } from 'apollo-boost';

const GET_TURNS = gql`
  query turns($filters: TurnFilters!) {
    turns(filters: $filters) {
      id
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

const TURN_BY_UNIQUE_ID = gql`
  query turnByUniqueId($uniqueId: Int!) {
    turnByUniqueId(uniqueId: $uniqueId) {
      id
      period
      start
      end
      uniqueId
    }
  }
`;

const GET_MOST_RECENTLY_ENDED_TURN = gql`
  query turnMostRecentlyEnded {
    turnMostRecentlyEnded {
      id
      period
      start
      end
      uniqueId
    }
  }
`;

const GET_REPORT = gql`
  query turnSummaryXLS($uniqueId: Int!) {
    turnSummaryXLS(uniqueId: $uniqueId)
  }
`;

const GET_TURN_SUMMARY = gql`
  query turnSummary {
    turnSummary {
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
