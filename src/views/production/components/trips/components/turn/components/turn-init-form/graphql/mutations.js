import { gql } from 'apollo-boost';

const INIT_PRODUCTION_TURN = gql`
    mutation productionTurnInit {
        productionTurnInit {
            id
            start
        }
    }
`;

export { INIT_PRODUCTION_TURN };
