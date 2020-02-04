import { gql } from 'apollo-boost';

const NEW_MESSAGES = gql`
  subscription newMessage {
    newMessage {
      id
      username
      content
    }
  }
`;

export { NEW_MESSAGES };
