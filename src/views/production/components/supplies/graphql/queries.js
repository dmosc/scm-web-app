import { gql } from 'apollo-boost';

const GET_SUPPLIES = gql`
    query supplies($filters: SupplyFilters!) {
        supplies(filters: $filters) {
            id
            name
            type
            unit
            quantity
        }
    }
`;

const GET_SUPPLY_TRANSACTIONS_IN = gql`
    query supplyTransactionsIn($filters: SupplyTransactionFilters!) {
        supplyTransactionsIn(filters: $filters) {
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

const GET_SUPPLY_TRANSACTIONS_OUT = gql`
    query supplyTransactionsOut($filters: SupplyTransactionFilters!) {
        supplyTransactionsOut(filters: $filters) {
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

export { GET_SUPPLIES, GET_SUPPLY_TRANSACTIONS_IN, GET_SUPPLY_TRANSACTIONS_OUT };
