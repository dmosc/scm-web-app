import React, {Component} from 'react';
import {Form} from 'antd';
import Container from 'components/common/container';
import Login from './components/login';
import {LoginContainer} from './elements';

class Auth extends Component {
  render() {
    const UserLoginForm = Form.create({name: 'login'})(Login);

    return (
      <LoginContainer>
        <Container width="40vh">
          <UserLoginForm />
        </Container>
      </LoginContainer>
    );
  }
}

export default Auth;
