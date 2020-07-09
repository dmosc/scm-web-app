import { gql } from 'apollo-boost';

const LAP_END = gql`
    mutation lapEnd($lap: LapEndInput!) {
        lapEnd(lap: $lap) {
            id
        }
    }
`;

const CANCEL_LAP = gql`
    mutation lapCancel($lap: LapCancelInput!) {
        lapCancel(lap: $lap) {
            id
        }
    }
`;

export { LAP_END, CANCEL_LAP };