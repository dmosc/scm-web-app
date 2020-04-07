import { gql } from 'apollo-boost';

const GET_MACHINES = gql`
  query machines($filters: MachineFilters!) {
    machines(filters: $filters) {
      id
      name
      plates
      brand
      model
      drivers
      averageHorometer
      standardHorometerDeviation
    }
  }
`;

export { GET_MACHINES };
