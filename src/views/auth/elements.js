import styled from 'styled-components';

const LoginContainer = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  display: flex;
  justify-content: flex-end;
  background-image: url('/static/images/background.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
`;

const Logo = styled.img`
  width: 100px;
  height: auto;
  display: block;
`;

export { LoginContainer, Logo };
