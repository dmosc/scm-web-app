import styled from 'styled-components';

const ReportsContainer = styled.div`
  /* 64 for header and 79 for footer */
  min-height: calc(100vh - 64px - 79px);
  overflow: scroll;
`;

const FiltersContainer = styled.div`
  display: flex;
  width: 100%;
  justify-content: flex-start;
`;

const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin: 0 10px;
`;

export { ReportsContainer, FiltersContainer, InputContainer };
