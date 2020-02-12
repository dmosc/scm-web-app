import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import shortid from 'shortid';
import { withApollo } from 'react-apollo';
import { Table, Button, Form } from 'antd';
import { GET_USERS } from './graphql/queries';
import { TableContainer, Card } from './elements';
import Title from './components/title';
import EditForm from './components/user-edit-form';
import NewForm from './components/new-user-form';

const Users = ({ client }) => {
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({ search: '' });
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [isNewUserModalOpen, toggleNewUserModal] = useState(false);

  const NewUserForm = Form.create({ name: 'user' })(NewForm);
  const UserEditForm = Form.create({ name: 'userEdit' })(EditForm);

  useEffect(() => {
    const getUsers = async () => {
      const {
        data: { users: usersToSet }
      } = await client.query({
        query: GET_USERS,
        variables: {
          filters
        }
      });

      if (!usersToSet) throw new Error('No users found');

      setLoading(false);
      setUsers(usersToSet);
    };

    getUsers();
  }, [client, filters]);

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

  const columns = [
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username'
    },
    {
      title: 'Name',
      dataIndex: 'firstName',
      key: 'firstName'
    },
    {
      title: 'Last name',
      dataIndex: 'lastName',
      key: 'lastName'
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email'
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role'
    },
    {
      title: 'Action',
      key: 'action',
      align: 'right',
      render: row => (
        <Button onClick={() => setCurrentUser(row)} type="default" icon="edit" size="small" />
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
            />
          )}
          size="small"
          scroll={{ x: true, y: true }}
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
    </TableContainer>
  );
};

Users.propTypes = {
  client: PropTypes.object.isRequired
};

export default withApollo(Users);
