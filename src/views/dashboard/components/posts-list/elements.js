import styled from 'styled-components';

const PostsListContainer = styled.div`
  overflow-y: scroll;
  position: relative;
  height: 50vh;
  max-height: 65vh;

  -ms-overflow-style: none;
  scrollbar-width: none;
  ::-webkit-scrollbar {
    display: none;
  }
`;

export { PostsListContainer };
