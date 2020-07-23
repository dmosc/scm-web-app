import { gql } from 'apollo-boost';

const GET_BORE_HOLES = gql`
    query boreHoles($filters: BoreHoleFilters!) {
        boreHoles(filters: $filters) {
            id
            folio
            date
            meters
            createdAt
            machine {
                name
                model
                type
            }
            createdBy {
                firstName
                lastName
            }
        }
    }
`;

export { GET_BORE_HOLES };