import React from 'react';
import { Form } from 'antd';
import Login from './components/login';
import { LoginContainer, Logo, Card } from './elements';

const Auth = () => {
  const UserLoginForm = Form.create({ name: 'login' })(Login);
  return (
    <LoginContainer>
      <Card>
        <Logo src="/static/images/gemsa-logo.jpeg" />
        <UserLoginForm />
      </Card>
    </LoginContainer>
  );
};

export default Auth;
