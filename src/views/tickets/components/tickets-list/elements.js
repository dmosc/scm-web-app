import styled from 'styled-components';

const LoadingBarContainer = styled.div`
  margin: 0;
  padding: 0;
  width: 7vw;
  height: 1vh;
  background: lightGrey;
  border-radius: 5px;
`;

const LoadingBar = styled.div`
  margin: 0;
  padding: 0;
  width: 4vh;
  height: 1vh;
  width: ${props =>
    props.totalPrice && props.outTruckImage
      ? '7vw'
      : props.outTruckImage || props.totalPrice
      ? '5vw'
      : '3vw'}
  background-color: ${props => (props.disabled ? 'lightGrey' : 'green')};
  border-radius: 5px;
  
  -webkit-transition: width 1000ms ease;
  -ms-transition: width 1000ms ease;
  transition: width 1000ms ease;
`;

export { LoadingBarContainer, LoadingBar };
