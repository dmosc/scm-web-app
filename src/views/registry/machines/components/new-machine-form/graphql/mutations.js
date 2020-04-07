import { gql } from 'apollo-boost';

const REGISTER_MACHINE = gql`
  mutation machine($machine: MachineInput!) {
    machine(machine: $machine) {
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

export { REGISTER_MACHINE };
