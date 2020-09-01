import { gql } from 'apollo-boost';

const GET_SUPPLIES = gql`
  query supplies($filters: SupplyFilters!) {
    supplies(filters: $filters) {
      id
      name
      type
      unit
      quantity
    }
  }
`;

export { GET_SUPPLIES };
