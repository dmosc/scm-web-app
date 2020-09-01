import styled from 'styled-components';

const TitleContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  overflow-x: scroll;

  ${props => props.theme.media.lg`
    flex-direction: column;
    align-items: flex-start;
  `}
`;

const SearchContainer = styled.div`
  > * {
    margin-right: 10px;
  }

  .search {
    width: 400;
  }

  ${props => props.theme.media.lg`
    margin-top: 20px;

    .search {
      width: 100%;
    }

    button {
      margin-top: 10px;
      margin-left: 10px;
    }

    > * {
      margin-right: 00px;
    }
  `}
`;

export { TitleContainer, SearchContainer };
