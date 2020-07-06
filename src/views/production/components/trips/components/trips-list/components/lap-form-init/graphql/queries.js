import { gql } from 'apollo-boost';

const GET_MACHINES = gql`
    query machines($filters: MachineFilters!) {
        machines(filters: $filters) {
            id
            name
        }
    }
`;

export { GET_MACHINES };