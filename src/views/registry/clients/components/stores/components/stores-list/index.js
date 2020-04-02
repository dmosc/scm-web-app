import React, { useEffect, useState } from 'react';
import { withApollo } from '@apollo/react-hoc';
import PropTypes from 'prop-types';
import { Typography, Button, List, message, Modal, notification, Tooltip } from 'antd';
import { GET_CLIENT_STORES } from './graphql/queries';
import { DELETE_STORE } from './graphql/mutations';

const { confirm } = Modal;
const { Text } = Typography;

const StoresList = ({ client, currentClient, setCurrentStore }) => {
  const [stores, setStores] = useState([]);

  useEffect(() => {
    const getData = async () => {
      const {
        data: { stores: storesToSet },
        errors
      } = await client.query({
        query: GET_CLIENT_STORES,
        variables: { client: currentClient.id }
      });

      if (errors) {
        message.error(errors[0].message);
      } else {
        setStores(storesToSet);
      }
    };

    getData();
  }, [client, currentClient]);

  const deleteStore = storeToDelete => {
    confirm({
      title: '¿Estás seguro de que deseas eliminar esta sucursal?',
      content: 'Una vez eliminado, ya no aparecerá en la lista de sucursales disponibles',
      okType: 'danger',
      onOk: async () => {
        await client.mutate({
          mutation: DELETE_STORE,
          variables: { id: storeToDelete.id }
        });

        setStores(stores.filter(({ id }) => id !== storeToDelete.id));

        notification.open({
          message: `La sucursal ${storeToDelete.name} ha sido removida`
        });
      },
      onCancel: () => {}
    });
  };

  return (
    <List
      bordered
      dataSource={stores}
      renderItem={store => (
        <List.Item
          actions={[
            <Tooltip placement="top" title="Editar">
              <Button
                style={{ marginRight: 5 }}
                onClick={() => setCurrentStore(store)}
                icon="edit"
                size="small"
              />
            </Tooltip>,
            <Tooltip placement="top" title="Eliminar">
              <Button
                style={{ marginRight: 5 }}
                onClick={() => deleteStore(store)}
                type="danger"
                icon="delete"
                size="small"
              />
            </Tooltip>
          ]}
        >
          <Text mark>{store.name}</Text>
          <Text underline>{store.address}</Text>
        </List.Item>
      )}
    />
  );
};

StoresList.propTypes = {
  client: PropTypes.object.isRequired,
  currentClient: PropTypes.object.isRequired,
  setCurrentStore: PropTypes.func.isRequired
};

export default withApollo(StoresList);
