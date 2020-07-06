import { gql } from 'apollo-boost';

const GET_PRODUCTION_TURN_SUMMARY = gql`
    query productionTurnSummary($id: ID!) {
        productionTurnSummary(id: $id) {
            totalLaps
            tons
            effectiveMinutes
            totalMinutes
            laps {
                id
                start
                end
                tons
                driver {
                    id
                    firstName
                    lastName
                }
                machine {
                    id
                    name
                    type
                }
                observations {
                    start
                }
            }
        }
    }
`;

export { GET_PRODUCTION_TURN_SUMMARY };