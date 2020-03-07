import { gql } from 'apollo-boost';

const GET_REPORT = gql`
  query turnSummaryXLS {
    turnSummaryXLS
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

export { GET_REPORT, GET_TURN_SUMMARY };
