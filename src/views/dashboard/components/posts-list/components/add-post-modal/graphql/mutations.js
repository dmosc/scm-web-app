import { gql } from 'apollo-boost';

const REGISTER_POST = gql`
  mutation post($post: PostInput!) {
    post(post: $post) {
      id
      author {
        id
        username
        firstName
        lastName
      }
      title
      content
      attachments
      gallery
      createdAt
    }
  }
`;

export { REGISTER_POST };
