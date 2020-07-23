import { gql } from 'apollo-boost';

const NEW_SUPPLY_TRANSACTION_IN = gql`
    mutation supplyTransactionIn($supplyTransactionIn: SupplyTransactionInInput!) {
        supplyTransactionIn(supplyTransactionIn: $supplyTransactionIn) {
            id
            date
            supply {
                id
                name
            }
            quantity
            comment
            isAdjustment
            createdBy {
                id
                firstName
                lastName
            }
        }
    }
`;

export { NEW_SUPPLY_TRANSACTION_IN };