import { gql } from 'apollo-boost';

const REGISTER_MACHINE = gql`
  mutation machine($machine: MachineInput!) {
    machine(machine: $machine) {
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

export { REGISTER_MACHINE };
