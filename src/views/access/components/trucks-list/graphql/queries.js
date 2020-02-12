import { gql } from 'apollo-boost';

const GET_ACTIVE_TICKETS = gql`
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

export { GET_ACTIVE_TICKETS };
