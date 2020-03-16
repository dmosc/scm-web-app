import { gql } from 'apollo-boost';

const GET_PRICE_REQUESTS = gql`
  query rockPriceRequests($filters: RockPriceRequestFilters!) {
    rockPriceRequests(filters: $filters) {
      id
      requester {
        id
        firstName
        lastName
      }
      rock {
        id
        name
      }
      createdAt
      reviewedBy {
        id
        firstName
        lastName
      }
      reviewedAt
      priceRequested
      floorPriceRequested
      status
    }
  }
`;

export { GET_PRICE_REQUESTS };
