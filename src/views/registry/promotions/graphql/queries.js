import { gql } from 'apollo-boost';

const GET_PROMOTIONS = gql`
  query promotions($filters: PromotionFilters!) {
    promotions(filters: $filters) {
      id
      name
      start
      end
      limit
      currentLimit
      credit
      bill
      product {
        rock {
          id
          name
        }
        price
      }
      clients {
        id
        businessName
      }
      groups {
        id
        name
      }
      createdBy {
        id
        firstName
        lastName
      }
      disabled
    }
  }
`;

export { GET_PROMOTIONS };
