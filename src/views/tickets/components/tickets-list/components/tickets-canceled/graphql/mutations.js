import { gql } from 'apollo-boost';

const ENABLE_TICKET = gql`
  mutation ticketEnable($id: ID!) {
    ticketEnable(id: $id)
  }
`;

export { ENABLE_TICKET };
