import {gql} from 'apollo-boost';

const REGISTER_MESSAGE = gql`
  mutation message($message: MessageInput!) {
    message(message: $message) {
      id
    }
  }
`;

export {REGISTER_MESSAGE};
