import { gql } from 'apollo-boost';

const END_PRODUCTION_TURN = gql`
  mutation productionTurnEnd($productionTurn: ProductionTurnEndInput!) {
    productionTurnEnd(productionTurn: $productionTurn) {
      id
      start
      end
    }
  }
`;

export { END_PRODUCTION_TURN };
