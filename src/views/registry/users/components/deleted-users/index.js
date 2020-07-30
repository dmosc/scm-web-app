import React, { useEffect, useState } from 'react';
import { withApollo } from '@apollo/react-hoc';
import PropTypes from 'prop-types';
import { Button, Drawer, List, message, Modal, Tooltip } from 'antd';
import { GET_DELETED_USERS } from './graphql/queries';
import { RESTORE_USER } from './graphql/mutations';

const { confirm } = Modal;

const DeletedUsers = ({ client, users, visible, toggleDeletedUsersModal, setUsers }) => {
  const [deletedUsers, setDeletedUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getDeletedUsers = async () => {
      setLoading(true);

      const {
        data: { deletedUsers: deletedUsersToSet }
      } = await client.query({ query: GET_DELETED_USERS });

      if (!deletedUsersToSet) {
        message.error('Ha sucedido un error cargando a los usuarios eliminados!');
      } else {
        setDeletedUsers(deletedUsersToSet);
      }

      setLoading(false);
    };

    getDeletedUsers();
  }, [client]);

  const restoreUser = userToRestore => {
    confirm({
      title: `¿Estás seguro de que deseas recuperar a ${userToRestore.username}?`,
      content:
        'Una vez recuperado, será considerado como un usuario activo en el sistema.',
      okType: 'danger',
      okText: 'Eliminar',
      cancelText: 'Cancelar',
      onOk: async () => {
        const { data: { userRestore } } = await client.mutate({
          mutation: RESTORE_USER,
          variables: { id: userToRestore.id }
        });

        if (userRestore) {
          const usersToSet = [userToRestore, ...users];
          setUsers(usersToSet);
          toggleDeletedUsersModal(false);
          message.success(`El usuario ${userToRestore.username} ha sido recuperado`);
        } else {
          message.error('Ha sucedido un error intentando recuperar al usuario!');
        }
      },
      onCancel: () => {
      }
    });
  };

  return (
    <Drawer
      title="Usuarios eliminados"
      visible={visible}
      onClose={() => toggleDeletedUsersModal(false)}
      width={600}
    >
      <List
        size="small"
        loading={loading}
        dataSource={deletedUsers}
        renderItem={user => (
          <List.Item
            actions={[
              <Tooltip placement="top" title="Recuperar">
                <Button
                  style={{ marginRight: 5 }}
                  onClick={() => restoreUser(user)}
                  type="primary"
                  icon="user-add"
                  size="small"
                />
              </Tooltip>
            ]}
            key={user.id}
          >
            {`${user.firstName} ${user.lastName}`}
          </List.Item>
        )}
      />
    </Drawer>
  );
};

DeletedUsers.propTypes = {
  client: PropTypes.object.isRequired,
  users: PropTypes.arrayOf(PropTypes.object).isRequired,
  visible: PropTypes.bool.isRequired,
  toggleDeletedUsersModal: PropTypes.func.isRequired,
  setUsers: PropTypes.func.isRequired
};

export default withApollo(DeletedUsers);