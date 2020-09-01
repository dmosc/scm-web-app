import { gql } from 'apollo-boost';

const GET_MACHINES = gql`
  query machines($filters: MachineFilters!) {
    machines(filters: $filters) {
      id
      name
    }
  }
`;

const GET_SUPPLIES = gql`
  query supplies($filters: SupplyFilters!) {
    supplies(filters: $filters) {
      id
      name
    }
  }
`;

export { GET_MACHINES, GET_SUPPLIES };
