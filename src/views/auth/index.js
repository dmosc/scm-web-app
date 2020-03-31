import React from 'react';
import { Form, Card } from 'antd';
import Login from './components/login';
import { LoginContainer, Logo } from './elements';

const Auth = () => {
  const UserLoginForm = Form.create({ name: 'login' })(Login);
  return (
    <LoginContainer>
      <Card
        style={{
          position: 'absolute',
          left: 0,
          width: 450,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Logo src="/static/images/gemsa-logo.jpeg" />
        <UserLoginForm />
      </Card>
    </LoginContainer>
  );
};

export default Auth;
