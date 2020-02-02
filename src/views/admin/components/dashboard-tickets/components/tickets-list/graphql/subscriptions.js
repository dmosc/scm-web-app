import {gql} from 'apollo-boost';

const ACTIVE_TICKETS = gql`
    subscription activeTickets {
        activeTickets {
            id
            folio
            driver
            credit
            bill
            client {
                firstName
                lastName
                businessName
                address
                zipcode
                rfc
                credit
                prices {
                    A4B
                    A4D
                    A5
                    BASE
                    CNC
                    G2
                    MIX
                    SUBBASE
                    SELLO
                }
            }
            truck {
                id
                plates
                weight
            }
            product {
                name
                price
            }
            turn {
                id
            }
            weight
            totalWeight
            totalPrice
            inTruckImage
            outTruckImage
        }
    }
`;

const TICKET_UPDATE = gql`
    subscription ticketUpdate {
        ticketUpdate {
            id
            folio
            driver
            credit
            bill
            client {
                firstName
                lastName
                businessName
                address
                rfc
                credit
                zipcode
                prices {
                    A4B
                    A4D
                    A5
                    BASE
                    CNC
                    G2
                    MIX
                    SUBBASE
                    SELLO
                }
            }
            truck {
                id
                plates
                weight
            }
            product {
                name
                price
            }
            turn {
                id
            }
            weight
            totalWeight
            totalPrice
            inTruckImage
            outTruckImage
        }
    }
`;

export {ACTIVE_TICKETS, TICKET_UPDATE};
