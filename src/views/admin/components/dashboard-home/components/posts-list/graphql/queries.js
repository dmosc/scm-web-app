import {gql} from 'apollo-boost';

const GET_POSTS = gql`
  query posts($filters: PostFilters!) {
    posts(filters: $filters) {
      id
      username
      title
      content
    }
  }
`;

export {GET_POSTS};
