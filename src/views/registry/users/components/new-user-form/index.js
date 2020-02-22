import React, { useState } from 'react';
import { withApollo } from 'react-apollo';
import { Form, Drawer, Icon, Input, Select, Button, notification } from 'antd';
import PropTypes from 'prop-types';
import roles from 'utils/enums/roles';
import { REGISTER_USER } from './graphql/mutations';

const { Option } = Select;

const NewUserForm = ({ client, form, visible, toggleNewUserModal, users, setUsers }) => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = e => {
    setLoading(true);
    e.preventDefault();
    form.validateFields(async (err, { username, email, firstName, lastName, password, role }) => {
      if (!err) {
        const {
          data: { user }
        } = await client.mutate({
          mutation: REGISTER_USER,
          variables: {
            user: { username, email, firstName, lastName, password, role }
          }
        });

        const usersToSet = [user, ...users];
        setLoading(false);
        setUsers(usersToSet);
        toggleNewUserModal(false);

        notification.open({
          message: `Usuario ${user.username} ha sido registrado exitosamente!`
        });

        form.resetFields();
      } else {
        setLoading(false);
      }
    });
  };

  return (
    <Drawer
      title="Añade un nuevo cliente"
      visible={visible}
      onClose={() => toggleNewUserModal(false)}
      width={600}
    >
      <Form onSubmit={handleSubmit}>
        <Form.Item>
          {form.getFieldDecorator('username', {
            rules: [
              {
                required: true,
                message: '¡Un nombre de usuario es requerido!'
              }
            ]
          })(
            <Input
              prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
              placeholder="Nombre de usuario"
            />
          )}
        </Form.Item>
        <Form.Item>
          {form.getFieldDecorator('email', {
            rules: [
              {
                required: true,
                message: '¡Un email es requerido!'
              }
            ]
          })(
            <Input
              prefix={<Icon type="mail" style={{ color: 'rgba(0,0,0,.25)' }} />}
              placeholder="Email"
            />
          )}
        </Form.Item>
        <Form.Item>
          {form.getFieldDecorator('firstName', {
            rules: [
              {
                required: true,
                message: 'Nombre(s) son requeridos!'
              }
            ]
          })(
            <Input
              prefix={<Icon type="info" style={{ color: 'rgba(0,0,0,.25)' }} />}
              placeholder="Nombres del usuario"
            />
          )}
        </Form.Item>
        <Form.Item>
          {form.getFieldDecorator('lastName', {
            rules: [
              {
                required: true,
                message: 'Apellidos son requeridos!'
              }
            ]
          })(
            <Input
              prefix={<Icon type="info" style={{ color: 'rgba(0,0,0,.25)' }} />}
              placeholder="Apellidos del usuario"
            />
          )}
        </Form.Item>
        <Form.Item>
          {form.getFieldDecorator('password', {
            rules: [
              {
                required: true,
                message: '¡Una contraseña es requerida!'
              }
            ]
          })(
            <Input
              type="password"
              prefix={<Icon type="question-circle" style={{ color: 'rgba(0,0,0,.25)' }} />}
              placeholder="Contraseña de acceso"
            />
          )}
        </Form.Item>
        <Form.Item>
          {form.getFieldDecorator('role')(
            <Select showSearch style={{ width: '100%' }} placeholder="Rol del usuario" allowClear>
              {roles.map(role => (
                <Option key={role} value={role}>
                  <span>{`${role}`}</span>
                </Option>
              ))}
            </Select>
          )}
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" icon="save" loading={loading}>
            {(loading && 'Espere...') || 'Guardar'}
          </Button>
        </Form.Item>
      </Form>
    </Drawer>
  );
};

NewUserForm.propTypes = {
  client: PropTypes.object.isRequired,
  form: PropTypes.object.isRequired,
  visible: PropTypes.bool.isRequired,
  toggleNewUserModal: PropTypes.func.isRequired,
  users: PropTypes.arrayOf(PropTypes.object).isRequired,
  setUsers: PropTypes.func.isRequired
};

export default withApollo(NewUserForm);
