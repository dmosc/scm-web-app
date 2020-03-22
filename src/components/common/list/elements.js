import styled from 'styled-components';

const ListContentContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const ContentList = styled.div`
  max-height: ${props => props.height ?? '20vh'};

  overflow-y: scroll;
  -ms-overflow-style: none;
  scrollbar-width: none;
  ::-webkit-scrollbar {
    display: none;
  }
`;

const TitleList = styled.h1`
  text-transform: uppercase;
  font-weight: bold;
`;

export { ListContentContainer, ContentList, TitleList };
