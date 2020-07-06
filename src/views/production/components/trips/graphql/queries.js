import { gql } from 'apollo-boost';

const GET_ACTIVE_PRODUCTION_TURN = gql`
    query productionTurnActive {
        productionTurnActive {
            id
            folio
            start
            end
            laps {
                id
                start
                end
                tons
            }
        }
    }
`;

export { GET_ACTIVE_PRODUCTION_TURN };