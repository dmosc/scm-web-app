import { gql } from 'apollo-boost';

const GET_SUMMARY = gql`
  query rockSalesReportCleanAndDirty(
    $filters: RockSalesReportCleanAndDirtyFilters!
    $dirty: [ID!]!
  ) {
    rockSalesReportCleanAndDirty(filters: $filters, dirty: $dirty) {
      clean {
        totalWeight
        total
      }
      dirty {
        totalWeight
        total
      }
    }
  }
`;

export { GET_SUMMARY };
