import React from 'react';
import { Form } from 'antd';
import Container from 'components/common/container';
import Login from './components/login';
import { LoginContainer } from './elements';

const Auth = () => {
  const UserLoginForm = Form.create({ name: 'login' })(Login);
  return (
    <LoginContainer>
      <Container width="40vw" opacity={0.9}>
        <UserLoginForm />
      </Container>
    </LoginContainer>
  );
};

export default Auth;
