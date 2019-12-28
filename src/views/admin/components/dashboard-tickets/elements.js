import styled from 'styled-components';

const LoadingBarContainer = styled.div`
  margin: 0;
  padding: 0;
  width: 4vh;
  height: 1vh;
  background: lightGrey;
`;

const LoadingBar = styled.div`
  margin: 0;
  padding: 0;
  width: 4vh;
  height: 1vh;
  width: ${props =>
    props.totalPrice ? '4vh' : props.outTruckImage ? '3vh' : '2vh'}
  background: green;
`;

export {LoadingBarContainer, LoadingBar};
