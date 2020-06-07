import styled from 'styled-components';

const PostsListContainer = styled.div`
  overflow-y: scroll;
  position: relative;
  max-height: 100vh;

  -ms-overflow-style: none;
  scrollbar-width: none;
  ::-webkit-scrollbar {
    display: none;
  }
`;

const PostContainer = styled.div`
  border: 1px solid #e8e8e8;
  border-radius: 5px;
  display: flex;
  padding: 15px;
  margin: 10px 0;

  &:first-child {
    margin-top: 0;
  }
`;

const PostContent = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`;

const ImagesContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
`;

const FilesContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

export { PostsListContainer, PostContainer, PostContent, ImagesContainer, FilesContainer };
