import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { withApollo } from 'react-apollo';
import cookie from 'react-cookies';
import toast from 'toast-me';
import { Form, Icon, Input, Button } from 'antd';
import { USER_LOGIN } from './graphql/mutations';

const Login = ({ form, client }) => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = e => {
    setLoading(true);

    e.preventDefault();
    form.validateFields(async (err, { username, password }) => {
      if (!err) {
        const { data, errors } = await client.mutate({
          mutation: USER_LOGIN,
          variables: { user: { usernameOrEmail: username, password } }
        });

        if (errors) {
          toast(errors[0].message, 'error', { duration: 3000, closeable: true });
          setLoading(false);
          return;
        }

        cookie.save('token', data.login, {
          path: '/',
          expires: new Date(Date.now() + 1000 * 60 * 60 * 24)
        });

        window.location.reload();
      } else {
        toast(err, 'error', { duration: 3000, closeable: true });
        setLoading(false);
      }
    });
  };

  return (
    <Form
      onSubmit={handleSubmit}
      style={{
        display: 'flex',
        alignItems: 'center'
      }}
    >
      <Form.Item style={{ marginBottom: 0, marginRight: 10 }}>
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
      <Form.Item style={{ marginBottom: 0, marginRight: 10 }}>
        {form.getFieldDecorator('password')(
          <Input
            prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
            type="password"
            placeholder="Contraseña"
          />
        )}
      </Form.Item>
      <Form.Item style={{ marginBottom: 0 }}>
        <Button
          type="primary"
          htmlType="submit"
          icon="login"
          loading={loading}
          style={{ width: '100%' }}
        >
          {(loading && 'Espere..') || 'Ingresar'}
        </Button>
      </Form.Item>
    </Form>
  );
};

Login.propTypes = {
  form: PropTypes.object.isRequired,
  client: PropTypes.object.isRequired
};

export default withApollo(Login);
