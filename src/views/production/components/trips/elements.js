import styled from 'styled-components';

const TripsContainer = styled.div`
  display: grid;
  grid-template-columns: 1.4fr 4fr;
  grid-gap: 30px;
  padding: 0 20px;
  width: 100%;
  /* 64 for header and 79 for footer */
  min-height: calc(100vh - 64px - 79px);
  height: calc(100vh - 64px - 79px);
  overflow-x: scroll;

  ${props => props.theme.media.lg`
    grid-template-columns: 1fr;
  `}
`;

export { TripsContainer };
