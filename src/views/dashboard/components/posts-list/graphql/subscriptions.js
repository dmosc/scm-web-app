import { gql } from 'apollo-boost';

const NEW_POSTS = gql`
  subscription newPost {
    newPost {
      id
      username
      title
      content
    }
  }
`;

export { NEW_POSTS };
