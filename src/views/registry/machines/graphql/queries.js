import { gql } from 'apollo-boost';

const GET_MACHINES = gql`
  query machines($filters: MachineFilters!) {
    machines(filters: $filters) {
      id
      name
      type
      plates
      brand
      model
      averageHorometer
      standardHorometerDeviation
    }
  }
`;

export { GET_MACHINES };
