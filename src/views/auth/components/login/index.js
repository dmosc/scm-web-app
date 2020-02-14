import React, { Component } from 'react';
import { withApollo } from 'react-apollo';
import cookie from 'react-cookies';
import toast from 'toast-me';
import { Form, Icon, Input, Button } from 'antd';
import { USER_LOGIN } from './graphql/mutations';

class Login extends Component {
  state = {
    loading: false
  };

  handleSubmit = e => {
    const { form, client } = this.props;
    this.setState({ loading: true });

    e.preventDefault();
    form.validateFields(async (err, { username, password }) => {
      if (!err) {
        const { data, errors } = await client.mutate({
          mutation: USER_LOGIN,
          variables: { user: { usernameOrEmail: username, password } }
        });

        if (errors) {
          toast(errors[0].message, 'error', { duration: 3000, closeable: true });
          this.setState({ loading: false });
          return;
        }

        cookie.save('token', data.login, {
          path: '/',
          expires: new Date(Date.now() + 1000 * 60 * 60 * 24)
        });

        window.location.reload();
      } else {
        toast(err, 'error', { duration: 3000, closeable: true });
        this.setState({ loading: false });
      }
    });
  };

  render() {
    const { form } = this.props;
    const { loading } = this.state;

    return (
      <Form onSubmit={this.handleSubmit} className="login-form">
        <Form.Item>
          {form.getFieldDecorator('username', {
            rules: [
              {
                required: true,
                message: 'Ingrese su email o nombre de usuario!'
              }
            ]
          })(
            <Input
              prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
              placeholder="Email o nombre de usuario"
            />
          )}
        </Form.Item>
        <Form.Item>
          {form.getFieldDecorator('password')(
            <Input
              prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
              type="password"
              placeholder="Contraseña"
            />
          )}
        </Form.Item>
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            className="login-form-button"
            icon="login"
            loading={loading}
          >
            {(loading && 'Espere..') || 'Ingresar'}
          </Button>
        </Form.Item>
      </Form>
    );
  }
}

export default withApollo(Login);
