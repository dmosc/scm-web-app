import { gql } from 'apollo-boost';

const EDIT_MACHINE = gql`
  mutation machineEdit($machine: MachineEditInput!) {
    machineEdit(machine: $machine) {
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

export { EDIT_MACHINE };
