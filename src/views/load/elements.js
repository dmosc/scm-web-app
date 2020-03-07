import styled from 'styled-components';

const LoadContainer = styled.div`
  display: flex;
  width: 100%;
  /* 64 for header and 79 for footer */
  min-height: calc(100vh - 64px - 79px);
`;

export default LoadContainer;
