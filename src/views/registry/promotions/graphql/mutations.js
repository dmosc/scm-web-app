import { gql } from 'apollo-boost';

const DELETE_PROMOTION = gql`
  mutation promotionDelete($id: ID!) {
    promotionDelete(id: $id)
  }
`;

const DISABLE_PROMOTION = gql`
  mutation promotionDisable($id: ID!) {
    promotionDisable(id: $id)
  }
`;

const ENABLE_PROMOTION = gql`
  mutation promotionEnable($id: ID!) {
    promotionEnable(id: $id)
  }
`;

export { DELETE_PROMOTION, DISABLE_PROMOTION, ENABLE_PROMOTION };
