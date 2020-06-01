import { gql } from 'apollo-boost';

const GET_BLASTS = gql`
    query blasts($filters: BlastFilters!) {
        blasts(filters: $filters) {
            id
            date
            products {
                product {
                    name
                }
                price
                quantity
            }
            documents
            tons
            createdBy {
                id
                username
            }
        }
    }
`;

export { GET_BLASTS };