import { gql } from 'apollo-boost';

const NEW_SUPPLY_TRANSACTION_IN = gql`
    mutation supplyTransactionOut($supplyTransactionOut: SupplyTransactionOutInput!) {
        supplyTransactionOut(supplyTransactionOut: $supplyTransactionOut) {
            id
            date
            supply {
                id
                name
            }
            quantity
            comment
            machine {
                id
                plates
            }
            createdBy {
                id
                firstName
                lastName
            }
        }
    }
`;

export { NEW_SUPPLY_TRANSACTION_IN };