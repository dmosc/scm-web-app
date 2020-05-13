import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { graphql, withApollo } from '@apollo/react-hoc';
import { useAuth } from 'components/providers/withAuth';
import debounce from 'debounce';
import { Button, Collapse, Dropdown, Icon, InputNumber, Menu, message, Typography } from 'antd';
import TicketPanel from './components/ticket-panel';
import TicketsCanceled from './components/tickets-canceled';
import { LoadingBar, LoadingBarContainer, TitleContainer } from './elements';
import { GET_PRODUCT_RATE, GET_TICKETS } from './graphql/queries';
import { ACTIVE_TICKETS, TICKET_UPDATE } from './graphql/subscriptions';
import { SET_PRODUCT_RATE } from './graphql/mutations';

const { Panel } = Collapse;
const { Title } = Typography;

const TicketList = ({ client, turnActive, setCurrent, loading, error, data, refetchTurn }) => {
  const { isAdmin } = useAuth();
  const [loadingProductRate, setLoadingProductRate] = useState(false);
  const [productRate, setProductRate] = useState(null);
  const [isCancelDrawerOpen, toggleCancelDrawer] = useState(false);

  useEffect(() => {
    const { subscribeToMore } = data;

    const unsubscribeToActiveTickets = subscribeToMore({
      document: ACTIVE_TICKETS,
      updateQuery: (prev, { subscriptionData: { data: newData } }) => {
        const { activeTickets } = newData;
        if (!activeTickets) return prev;

        const tickets = [...activeTickets];

        return { activeTickets: tickets };
      }
    });

    const unsubscribeToTicketUpdates = subscribeToMore({
      document: TICKET_UPDATE,
      updateQuery: (prev, { subscriptionData: { data: newData } }) => {
        const { activeTickets: oldTickets } = prev;
        const { ticketUpdate } = newData;
        if (!ticketUpdate) return prev;

        let tickets = [...oldTickets];

        for (let i = 0; i < oldTickets.length; i++)
          if (ticketUpdate.id === oldTickets[i].id)
            if (ticketUpdate.turn) tickets = tickets.splice(i, 1);
            else tickets[i] = ticketUpdate;

        return { activeTickets: tickets };
      }
    });

    return () => {
      unsubscribeToActiveTickets();
      unsubscribeToTicketUpdates();
    };
  }, [data]);

  useEffect(() => {
    const getProductRate = async () => {
      setLoadingProductRate(true);
      const {
        data: { productRate: productRateToSet }
      } = await client.query({ query: GET_PRODUCT_RATE });

      setProductRate(productRateToSet);
      setLoadingProductRate(false);
    };

    getProductRate();
  }, [client, productRate]);

  const onProductRateChange = async newProductRate => {
    if (
      !Number.isNaN(newProductRate) &&
      newProductRate !== productRate?.rate &&
      newProductRate <= 10
    ) {
      setLoadingProductRate(true);
      try {
        const {
          data: { productRate: productRateToSet }
        } = await client.mutate({
          mutation: SET_PRODUCT_RATE,
          variables: { rate: newProductRate }
        });

        setProductRate(productRateToSet);

        message.success('La tarifa dinámica ha sido actualizada correctamente!');
      } catch (e) {
        message.error('No ha sido posible modificar la tarifa dinámica!');
      }

      setLoadingProductRate(false);
    }
  };

  if (loading) return <Title level={4}>Cargando boletas...</Title>;
  if (error) return <Title level={4}>¡No se han podido cargar las boletas!</Title>;

  const { activeTickets, refetch } = data;

  return (
    <>
      <TitleContainer>
        {activeTickets?.length === 0 ? (
          <Title level={4}>No hay tickets disponibles...</Title>
        ) : (
          <Title level={4}>Lista de boletas</Title>
        )}
        <div>
          {isAdmin && (
            <>
              <Icon
                type="loading"
                style={{ marginRight: 10, display: loadingProductRate ? null : 'none' }}
              />
              <InputNumber
                disabled={loadingProductRate}
                defaultValue={productRate?.rate || 0}
                value={productRate?.rate || 0}
                min={0}
                max={10}
                step={0.1}
                formatter={value => `${value}%`}
                parser={value => value.replace('%', '')}
                onChange={debounce(onProductRateChange, 1000)}
              />
            </>
          )}
          <Dropdown
            overlay={
              <Menu>
                <Menu.Item onClick={() => toggleCancelDrawer(true)}>Ver cancelados</Menu.Item>
              </Menu>
            }
          >
            <Button type="link">
              Opciones <Icon type="down" />
            </Button>
          </Dropdown>
        </div>
      </TitleContainer>
      {activeTickets?.length !== 0 && (
        <Collapse accordion style={{ overflowY: 'scroll' }}>
          {activeTickets?.map(ticket => (
            <Panel
              disabled={!turnActive}
              key={ticket.id}
              header={`${ticket.truck.plates}`}
              extra={
                <LoadingBarContainer>
                  <LoadingBar
                    disabled={!turnActive}
                    totalPrice={ticket.totalPrice}
                    outTruckImage={ticket.outTruckImage}
                  />
                </LoadingBarContainer>
              }
            >
              <TicketPanel
                ticket={ticket}
                turn={turnActive}
                refetchTickets={refetch}
                refetchTurn={refetchTurn}
                setCurrent={setCurrent}
              />
            </Panel>
          ))}
        </Collapse>
      )}
      {isCancelDrawerOpen && (
        <TicketsCanceled
          close={() => toggleCancelDrawer(false)}
          refetchTickets={refetch}
          refetchTurn={refetchTurn}
        />
      )}
    </>
  );
};

TicketList.defaultProps = {
  loading: false,
  error: false,
  turnActive: null
};

TicketList.propTypes = {
  client: PropTypes.object.isRequired,
  data: PropTypes.object.isRequired,
  refetchTurn: PropTypes.func.isRequired,
  turnActive: PropTypes.object,
  setCurrent: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  error: PropTypes.bool
};

export default graphql(GET_TICKETS, { options: () => ({ variables: { filters: {} } }) })(
  withApollo(TicketList)
);
