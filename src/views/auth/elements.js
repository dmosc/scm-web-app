import styled from 'styled-components';

const LoginContainer = styled.div`
  width: 100%;
  position: relative;
  background-image: url('/static/images/background.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  height: 100vh;
`;

const Logo = styled.img`
  width: 200px;
  height: auto;
  margin: 20px auto;
  display: block;
`;

export { LoginContainer, Logo };
