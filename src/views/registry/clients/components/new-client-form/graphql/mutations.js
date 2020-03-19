import { gql } from 'apollo-boost';

const REGISTER_CLIENT = gql`
    mutation client($client: ClientInput!) {
        client(client: $client) {
            id
            firstName
            lastName
            email
            role
            businessName
            rfc
            CFDIuse
            cellphone
            address {
                country
                state
                municipality
                city
                suburb
                street
                extNumber
                intNumber
                zipcode
            }
            prices {
                rock {
                    id
                    name
                }
                price
            }
            credit
        }
    }
`;

export { REGISTER_CLIENT };
