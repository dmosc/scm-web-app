import { gql } from 'apollo-boost';

const GET_TICKETS = gql`
    query activeTickets($filters: TicketFilters!) {
        activeTickets(filters: $filters) {
            id
            folio
            client {
                businessName
            }
            truck {
                plates
            }
            product {
                name
            }
        }
    }
`;

export { GET_TICKETS };
