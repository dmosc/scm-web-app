import styled from 'styled-components';
import { Card as CommonCard } from 'antd';

const LoginContainer = styled.div`
  width: 100%;
  position: relative;
  background-image: url('/static/images/background.jpeg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  height: 100vh;
`;

const Logo = styled.img`
  width: 100px;
  height: auto;
  display: block;
`;

const Card = styled(CommonCard)`
  .ant-card-body {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .ant-card-body::before {
    display: none;
  }
  .ant-card-body::after {
    display: none;
  }
`;

export { LoginContainer, Logo, Card };
