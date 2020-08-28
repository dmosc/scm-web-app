import { gql } from 'apollo-boost';

const DELETE_TICKET = gql`
    mutation ticketDelete($id: ID!) {
        ticketDelete(id: $id)
    }
`;

export { DELETE_TICKET };
