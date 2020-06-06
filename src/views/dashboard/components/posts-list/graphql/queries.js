import { gql } from 'apollo-boost';

const GET_POSTS = gql`
  query posts($filters: PostFilters!) {
    posts(filters: $filters) {
      id
      author {
        id
        firstName
        lastName
        username
      }
      title
      content
      attachments
      gallery
      createdAt
    }
  }
`;

export { GET_POSTS };
