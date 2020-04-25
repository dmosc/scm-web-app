import { gql } from 'apollo-boost';

const REGISTER_PROMOTION = gql`
  mutation promotion($promotion: PromotionInput!) {
    promotion(promotion: $promotion) {
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
      createdBy {
        id
        firstName
        lastName
      }
      disabled
    }
  }
`;

const EDIT_PROMOTION = gql`
  mutation promotionEdit($promotion: PromotionEditInput!) {
    promotionEdit(promotion: $promotion) {
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
      createdBy {
        id
        firstName
        lastName
      }
      disabled
    }
  }
`;

export { REGISTER_PROMOTION, EDIT_PROMOTION };
