import { gql } from 'apollo-boost';

const GET_HISTORY_TICKETS = gql`
    query archivedTickets($filters: TicketFilters!) {
        archivedTickets(filters: $filters) {
            id
            folio
            driver
            client
            businessName
            address
            rfc
            plates
            truckWeight
            totalWeight
            tons
            product
            price
            tax
            total
            inTruckImage
            outTruckImage
            createdAt
            updatedAt
        }
    }
`;

export { GET_HISTORY_TICKETS };
