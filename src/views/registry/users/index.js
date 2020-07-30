import React, { useEffect, useState } from 'react';
import { withApollo } from 'react-apollo';
import { useDebounce } from 'use-lodash-debounce';
import { useAuth } from 'components/providers/withAuth';
import PropTypes from 'prop-types';
import shortid from 'shortid';
import { Button, Form, message, Modal, Row, Table, Tooltip } from 'antd';
import { Card, TableContainer } from './elements';
import Title from './components/title';
import EditForm from './components/user-edit-form';
import NewForm from './components/new-user-form';
import { GET_USERS } from './graphql/queries';
import { DELETE_USER } from './graphql/mutations';
import DeletedUsers from './components/deleted-users';

const { confirm } = Modal;

const Users = ({ client }) => {
  const { isAdmin, isSupport, isManager, isCashier } = useAuth();
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({ search: '' });
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isNewUserModalOpen, toggleNewUserModal] = useState(false);
  const [isDeletedUsersModalOpen, toggleDeletedUsersModal] = useState(false);
  const debouncedFilters = useDebounce(filters, 1000);

  const NewUserForm = Form.create({ name: 'user' })(NewForm);
  const UserEditForm = Form.create({ name: 'userEdit' })(EditForm);

  useEffect(() => {
    const getUsers = async () => {
      const {
        data: { users: usersToSet }
      } = await client.query({
        query: GET_USERS,
        variables: { filters: debouncedFilters }
      });

      if (!usersToSet) throw new Error('No users found');

      setLoading(false);
      setUsers(usersToSet);
    };

    getUsers();
  }, [debouncedFilters, client]);

  const handleFilterChange = (key, value) => {
    const filtersToSet = { ...filters, [key]: value };

    setFilters(filtersToSet);
  };

  const onUserEdit = user => {
    const usersToSet = [...users];

    usersToSet.forEach(({ id }, i) => {
      if (user.id === id) usersToSet[i] = { ...user };
    });

    setUsers(usersToSet);
  };

  const deleteUser = userToDelete => {
    confirm({
      title: `¿Estás seguro de que deseas eliminar a ${userToDelete.username}?`,
      content:
        'Una vez eliminado ya no será considerado dentro del sistema hasta que sea reintegrado por un supervisor.',
      okType: 'danger',
      okText: 'Eliminar',
      cancelText: 'Cancelar',
      onOk: async () => {
        const { data: { userDelete } } = await client.mutate({
          mutation: DELETE_USER,
          variables: { id: userToDelete.id }
        });

        if (userDelete) {
          setUsers(users.filter(({ id }) => id !== userToDelete.id));
          message.success(`El usuario ${userToDelete.username} ha sido removido`);
        } else {
          message.error('Ha sucedido un error intentando eliminar al usuario!');
        }
      },
      onCancel: () => {
      }
    });
  };

  const columns = [
    {
      title: 'Nombre de usuario',
      dataIndex: 'username',
      key: 'username'
    },
    {
      title: 'Nombres',
      dataIndex: 'firstName',
      key: 'firstName'
    },
    {
      title: 'Apellidos',
      dataIndex: 'lastName',
      key: 'lastName'
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email'
    },
    {
      title: 'Rol',
      dataIndex: 'role',
      key: 'role'
    },
    {
      title: 'Acciones',
      key: 'action',
      align: 'right',
      render: row => (
        <Row>
          {(isAdmin || isManager || isSupport) && (
            <Tooltip placement="top" title="Editar">
              <Button
                onClick={() => setCurrentUser(row)}
                disabled={
                  isCashier
                    ? row.role === 'ADMIN' || row.role === 'MANAGER' || row.role === 'SUPPORT'
                    : isSupport
                    ? row.role === 'ADMIN' || row.role === 'MANAGER'
                    : (isManager && row.role === 'ADMIN') || (isManager && row.role === 'MANAGER')
                }
                type="default"
                icon="edit"
                size="small"
                style={{ marginRight: 5 }}
              />
            </Tooltip>
          )}
          {(isAdmin || isManager || isSupport) && (
            <Tooltip placement="top" title="Eliminar">
              <Button
                onClick={() => deleteUser(row)}
                disabled={
                  isCashier
                    ? row.role === 'ADMIN' || row.role === 'MANAGER' || row.role === 'SUPPORT'
                    : isSupport
                    ? row.role === 'ADMIN' || row.role === 'MANAGER'
                    : (isManager && row.role === 'ADMIN') || (isManager && row.role === 'MANAGER')
                }
                type="danger"
                icon="delete"
                size="small"
              />
            </Tooltip>
          )}
        </Row>

      )
    }
  ];

  return (
    <TableContainer>
      <Card>
        <Table
          loading={loading}
          columns={columns}
          title={() => (
            <Title
              handleFilterChange={handleFilterChange}
              toggleNewUserModal={toggleNewUserModal}
              toggleDeletedUsersModal={toggleDeletedUsersModal}
            />
          )}
          size="small"
          pagination={{ defaultPageSize: 20 }}
          dataSource={users.map(userMapped => ({ ...userMapped, key: shortid.generate() }))}
        />
      </Card>
      {currentUser && (
        <UserEditForm
          onUserEdit={onUserEdit}
          setCurrentUser={setCurrentUser}
          currentUser={currentUser}
        />
      )}
      {isNewUserModalOpen && (
        <NewUserForm
          users={users}
          visible={isNewUserModalOpen}
          toggleNewUserModal={toggleNewUserModal}
          setUsers={setUsers}
        />
      )}
      {isDeletedUsersModalOpen && (
        <DeletedUsers
          users={users}
          visible={isDeletedUsersModalOpen}
          toggleDeletedUsersModal={toggleDeletedUsersModal}
          setUsers={setUsers}
        />
      )}
    </TableContainer>
  );
};

Users.propTypes = {
  client: PropTypes.object.isRequired
};

export default withApollo(Users);
