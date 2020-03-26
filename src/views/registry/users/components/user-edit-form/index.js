import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { withApollo } from 'react-apollo';
import { hashSync as hash } from 'bcryptjs';
import { Button, Drawer, Form, Icon, Input, notification, Select } from 'antd';
import roles from 'utils/enums/roles';
import { useAuth } from '../../../../../components/providers/withAuth';
import { EDIT_USER } from './graphql/mutations';

const { Option } = Select;

const EditForm = ({ form, currentUser, onUserEdit, setCurrentUser, client }) => {
  const { isManager, isSupport } = useAuth();
  const [loading, setLoading] = useState(false);
  let filteredRoles = [...roles];

  if (isManager) filteredRoles = filteredRoles.filter(role => role !== 'ADMIN');
  if (isSupport)
    filteredRoles = filteredRoles.filter(role => role !== 'ADMIN' && role !== 'MANAGER');

  const handleSubmit = e => {
    const { id, password: currentPassword } = currentUser;

    setLoading(true);
    e.preventDefault();
    form.validateFields(
      async (err, { username, email, firstName, lastName, password: newPassword, role }) => {
        const password = newPassword ? hash(newPassword, 10) : currentPassword;
        if (!err) {
          const {
            data: { userEdit: user }
          } = await client.mutate({
            mutation: EDIT_USER,
            variables: {
              user: {
                id,
                username,
                email,
                firstName,
                lastName,
                password,
                role
              }
            }
          });

          notification.open({
            message: `Usuario ${user.username} ha sido editado exitosamente!`
          });

          onUserEdit(user);
          setCurrentUser();
          form.resetFields();
        }

        setLoading(false);
      }
    );
  };

  return (
    <Drawer
      title={`Editando usuario: ${currentUser.username}`}
      visible={currentUser !== null}
      onClose={() => setCurrentUser()}
      width={600}
    >
      <Form onSubmit={handleSubmit}>
        <Form.Item>
          {form.getFieldDecorator('username', {
            initialValue: currentUser.username
          })(
            <Input
              prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
              placeholder="Nombre de usuario"
            />
          )}
        </Form.Item>
        <Form.Item>
          {form.getFieldDecorator('email', { initialValue: currentUser.email })(
            <Input
              prefix={<Icon type="mail" style={{ color: 'rgba(0,0,0,.25)' }} />}
              placeholder="Email"
            />
          )}
        </Form.Item>
        <Form.Item>
          {form.getFieldDecorator('firstName', {
            initialValue: currentUser.firstName
          })(
            <Input
              prefix={<Icon type="info" style={{ color: 'rgba(0,0,0,.25)' }} />}
              placeholder="Nombres del usuario"
            />
          )}
        </Form.Item>
        <Form.Item>
          {form.getFieldDecorator('lastName', {
            initialValue: currentUser.lastName
          })(
            <Input
              prefix={<Icon type="info" style={{ color: 'rgba(0,0,0,.25)' }} />}
              placeholder="Apellidos del usuario"
            />
          )}
        </Form.Item>
        <Form.Item>
          {form.getFieldDecorator('password')(
            <Input
              type="password"
              prefix={<Icon type="question-circle" style={{ color: 'rgba(0,0,0,.25)' }} />}
              placeholder="Contraseña de acceso"
              disabled={isSupport}
            />
          )}
        </Form.Item>
        <Form.Item>
          {form.getFieldDecorator('role', { initialValue: currentUser.role })(
            <Select showSearch style={{ width: '100%' }} placeholder="Rol del usuario" allowClear>
              {filteredRoles.map(role => (
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

EditForm.propTypes = {
  client: PropTypes.object.isRequired,
  form: PropTypes.object.isRequired,
  currentUser: PropTypes.shape({
    id: PropTypes.string,
    password: PropTypes.string,
    username: PropTypes.string,
    firstName: PropTypes.string,
    lastName: PropTypes.string,
    email: PropTypes.string,
    role: PropTypes.string
  }).isRequired,
  onUserEdit: PropTypes.func.isRequired,
  setCurrentUser: PropTypes.func.isRequired
};

export default withApollo(EditForm);
