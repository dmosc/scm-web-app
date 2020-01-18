import {gql} from 'apollo-boost';

const GET_MESSAGES = gql`
  query messages($filters: MessageFilters!) {
    messages(filters: $filters) {
      id
      username
      content
    }
  }
`;

export {GET_MESSAGES};
