import {gql} from 'apollo-boost';

const GET_TURN_SUMMARY = gql`
    query turnSummary {
        turnSummary {
            clients {
                info {
                    id
                    businessName
                }
                count
                tickets {
                    id
                    folio
                    driver
                    tax
                    weight
                    totalWeight
                    totalPrice
                    credit
                    inTruckImage
                    outTruckImage
                }
            }
            upfront
            credit
            total
        }
    }
`;

export {GET_TURN_SUMMARY};