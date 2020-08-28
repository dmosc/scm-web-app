import { gql } from 'apollo-boost';

const DELETE_TICKET = gql`
    mutation ticketDelete($id: ID!) {
        ticketDelete(id: $id)
    }
`;

const TICKET_TO_BILL = gql`
    mutation ticketToBill($id: ID!) {
        ticketToBill(id: $id) {
            id
            folio
            bill
            out
            client {
                id
                businessName
            }
            truck {
                id
                plates
            }
            totalPrice
            product {
                id
                name
            }
            tax
        }
    }
`;

const TICKET_TO_NO_BILL = gql`
    mutation ticketToNoBill($id: ID!) {
        ticketToNoBill(id: $id) {
            id
            folio
            bill
            out
            client {
                id
                businessName
            }
            truck {
                id
                plates
            }
            totalPrice
            product {
                id
                name
            }
            tax
        }
    }
`;

const TICKET_UPDATE_PRICE = gql`
    mutation ticketUpdatePrice($id: ID!, $price: Float!) {
        ticketUpdatePrice(id: $id, price: $price) {
            id
            folio
            bill
            out
            client {
                id
                businessName
            }
            truck {
                id
                plates
            }
            totalPrice
            product {
                id
                name
            }
            tax
        }
    }
`;

export { DELETE_TICKET, TICKET_TO_BILL, TICKET_TO_NO_BILL, TICKET_UPDATE_PRICE };
