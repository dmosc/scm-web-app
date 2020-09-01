import styled from 'styled-components';
import { List } from 'antd';

const TicketsContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 4fr;
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

const StyledList = styled(List)`
  ${props => props.theme.media.lg`
    max-height: 100px;
    overflow-y: scroll;
  `}
`;

export { TicketsContainer, StyledList };
