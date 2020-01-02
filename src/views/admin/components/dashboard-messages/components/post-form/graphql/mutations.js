import {gql} from 'apollo-boost';

const REGISTER_POST = gql`
  mutation post($post: PostInput!) {
    post(post: $post) {
      title
    }
  }
`;

export {REGISTER_POST};
