import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withApollo } from 'react-apollo';
import { hashSync as hash } from 'bcryptjs';
import { Drawer, Form, Input, Select, Button, Icon, notification } from 'antd';
import roles from 'utils/enums/roles';
import { EDIT_USER } from './graphql/mutations';

const { Option } = Select;

class EditForm extends Component {
  state = {
    loading: false
  };

  handleSubmit = e => {
    const {
      form,
      currentUser: { id, password: currentPassword },
      onUserEdit,
      setCurrentUser,
      client
    } = this.props;

    this.setState({ loading: true });
    e.preventDefault();
    form.validateFields(
      async (err, { username, email, firstName, lastName, password: newPassword, role }) => {
        const password = newPassword ? hash(newPassword, 10) : currentPassword;
        if (!err) {
          try {
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
          } catch (errors) {
            errors.graphQLErrors.map(({ message }) =>
              notification.open({
                message
              })
            );
            this.setState({ loading: false });
          }
        } else {
          this.setState({ loading: false });
        }
      }
    );
  };

  handleCancel = () => {
    const { setCurrentUser } = this.props;

    setCurrentUser();
  };

  render() {
    const { form, currentUser } = this.props;
    const { loading } = this.state;

    return (
      <Drawer
        title={`Editando usuario: ${currentUser.username}`}
        visible={currentUser !== null}
        onClose={this.handleCancel}
        width={600}
      >
        <Form onSubmit={this.handleSubmit}>
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
              />
            )}
          </Form.Item>
          <Form.Item>
            {form.getFieldDecorator('role', { initialValue: currentUser.role })(
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
  }
}

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
