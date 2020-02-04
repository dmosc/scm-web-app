import React, { Component } from 'react';
import { withApollo } from 'react-apollo';
import { Form, Icon, Input, Button, Select, notification } from 'antd';
import roles from 'utils/enums/roles';
import UserList from './components/user-list';
import { FormContainer, TitleContainer, TitleList } from './elements';
import { REGISTER_USER } from './graphql/mutations';
import { GET_USERS } from './graphql/queries';

const { Option } = Select;

class UserForm extends Component {
  state = {
    loading: false,
    visible: false,
    users: []
  };

  componentDidMount = async () => {
    const { client } = this.props;
    this.setState({ loadingUsers: true });

    try {
      const {
        data: { users }
      } = await client.query({
        query: GET_USERS,
        variables: {
          filters: {}
        }
      });

      if (!users) throw new Error('No users found');

      this.setState({ users, loadingUsers: false });
    } catch (e) {
      this.setState({ loadingUsers: false });
    }
  };

  handleSubmit = e => {
    const { form, client } = this.props;
    const { users: oldUsers } = this.state;

    this.setState({ loading: true });
    e.preventDefault();
    form.validateFields(async (err, { username, email, firstName, lastName, password, role }) => {
      if (!err) {
        try {
          const {
            data: { user }
          } = await client.mutate({
            mutation: REGISTER_USER,
            variables: {
              user: { username, email, firstName, lastName, password, role }
            }
          });

          const users = [user, ...oldUsers];
          this.setState({ loading: false, users });

          notification.open({
            message: `Usuario ${user.username} ha sido registrado exitosamente!`
          });

          form.resetFields();
        } catch (e) {
          e['graphQLErrors'].map(({ message }) =>
            notification.open({
              message
            })
          );
          this.setState({ loading: false });
        }
      } else {
        this.setState({ loading: false });
      }
    });
  };

  toggleList = () => {
    const { visible } = this.state;
    this.setState({ visible: !visible });
  };

  onUserEdit = user => {
    const { users: oldUsers } = this.state;
    const users = [...oldUsers];

    users.forEach(({ id }, i) => {
      if (user.id === id) users[i] = { ...user };
    });

    this.setState({ users });
  };

  render() {
    const { form } = this.props;
    const { loading, visible, users } = this.state;

    return (
      <FormContainer>
        <TitleContainer>
          <TitleList>Registrar usuario</TitleList>
          <Button type="link" onClick={this.toggleList}>
            Ver usuarios
          </Button>
        </TitleContainer>
        <Form onSubmit={this.handleSubmit}>
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
              {(loading && 'Espere..') || 'Guardar'}
            </Button>
          </Form.Item>
        </Form>
        <UserList
          visible={visible}
          users={users}
          onUserEdit={this.onUserEdit}
          toggleList={this.toggleList}
        />
      </FormContainer>
    );
  }
}

export default withApollo(UserForm);
