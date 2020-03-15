import { gql } from 'apollo-boost';

const GET_PRICE_REQUESTS = gql`
  query priceRequests($filters: PriceRequestFilters!) {
    priceRequests(filters: $filters) {
      id
      requester {
        id
        firstName
        lastName
      }
      client {
        id
        businessName
      }
      createdAt
      reviewedBy {
        id
        firstName
        lastName
      }
      reviewedAt
      prices {
        rock {
          id
          name
        }
        priceRequested
      }
      status
    }
  }
`;

export { GET_PRICE_REQUESTS };
