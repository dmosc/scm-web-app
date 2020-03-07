import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { graphql, withApollo } from '@apollo/react-hoc';
import { List, Select, Modal, Button, notification } from 'antd';
import { ListContainer } from './elements';
import { GET_ACTIVE_TICKETS, GET_ROCKS } from './graphql/queries';
import { EDIT_TICKET, PRODUCT_LOAD_TICKET } from './graphql/mutations';
import { ACTIVE_TICKETS } from './graphql/subscriptions';

const { Option } = Select;
const { confirm } = Modal;

const TrucksList = ({ client, data }) => {
  const { subscribeToMore, loading, error, notLoadedActiveTickets: tickets } = data;
  const [products, setProducts] = useState([]);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const handleProductChange = async (ticket, product) => {
    confirm({
      title: 'Realizar cambio de producto?',
      okText: 'Continuar',
      cancelText: 'Canelar',
      okType: 'primary',
      onOk: async () => {
        try {
          await client.mutate({
            mutation: EDIT_TICKET,
            variables: { ticket: { ticket, product } }
          });

          notification.success({ message: 'La boleta ha sido actualizada exitosamente!' });
        } catch (e) {
          notification.error({ message: 'Ha habido un error confirmando el cambio del producto!' });
        }
      },
      onCancel: () => {
        notification.success({ message: 'Se ha cancelado el cambio exitosamente!' });
      }
    });
  };

  const handleTicketProductLoad = async ticket => {
    setLoadingSubmit(true);

    try {
      await client.mutate({
        mutation: PRODUCT_LOAD_TICKET,
        variables: { ticket: { ticket } }
      });

      notification.success({ message: 'La boleta ha sido actualizada exitosamente!' });
    } catch (e) {
      notification.error({ message: 'Ha habido un error confirmando la carga de producto!' });
    }

    setLoadingSubmit(false);
  };

  useEffect(() => {
    let unsubscribeToActiveTickets;

    const subscribeToActiveTickets = () => {
      return subscribeToMore({
        document: ACTIVE_TICKETS,
        updateQuery: (prev, { subscriptionData }) => {
          const { notLoadedActiveTickets } = subscriptionData.data;
          if (!notLoadedActiveTickets) return prev;

          return { notLoadedActiveTickets: [...notLoadedActiveTickets] };
        }
      });
    };

    if (!unsubscribeToActiveTickets) unsubscribeToActiveTickets = subscribeToActiveTickets();

    return () => unsubscribeToActiveTickets();
  }, [subscribeToMore]);

  useEffect(() => {
    setLoadingProducts(true);

    const getProducts = async () => {
      try {
        const {
          data: { rocks: productsToSet }
        } = await client.query({
          query: GET_ROCKS,
          variables: { filters: {} }
        });

        setProducts(productsToSet);
      } catch (e) {
        notification.error({ message: 'Ha habido un error cargando los productos!' });
      }
      setLoadingProducts(false);
    };

    getProducts();
  }, [client, setLoadingProducts]);

  return (
    <ListContainer>
      {error ? (
        <div>¡No se han podido cargar los camiones!</div>
      ) : loading ? (
        <div>Cargando camiones activos...</div>
      ) : (
        <List
          loading={loading}
          itemLayout="horizontal"
          dataSource={tickets}
          size="small"
          renderItem={ticket => (
            <List.Item
              actions={[
                <Select
                  loading={loadingProducts}
                  value={ticket.product.id}
                  style={{ width: 120 }}
                  onChange={product => handleProductChange(ticket.id, product)}
                >
                  {products.map(({ id, name }) => (
                    <Option key={id} value={id}>
                      {name}
                    </Option>
                  ))}
                </Select>,
                <Button
                  type="primary"
                  loading={loadingSubmit}
                  onClick={() => handleTicketProductLoad(ticket.id)}
                >
                  Cargar
                </Button>
              ]}
            >
              <List.Item.Meta
                title={`${ticket.truck.plates} : ${ticket.product.name}`}
                description={`${ticket.client.businessName}`}
              />
            </List.Item>
          )}
        />
      )}
    </ListContainer>
  );
};

TrucksList.propTypes = {
  data: PropTypes.object.isRequired,
  client: PropTypes.object.isRequired
};

export default withApollo(
  graphql(GET_ACTIVE_TICKETS, { options: () => ({ variables: { filters: {} } }) })(TrucksList)
);
