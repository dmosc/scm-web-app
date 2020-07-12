import styled from 'styled-components';

const TitleContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
`;

const SearchContainer = styled.div`
  > * {
    margin-right: 10px;
  }
`;

export { TitleContainer, SearchContainer };
