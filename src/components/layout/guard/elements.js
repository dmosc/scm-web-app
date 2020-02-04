import styled from 'styled-components';

const Main = styled.div`
  display: flex;
  flex: wrap;
  justify-content: ${props => (props.justify ? props.justify : 'flex-start')};
  height: 100vh;
  overflow-y: scroll;
`;

export { Main };
