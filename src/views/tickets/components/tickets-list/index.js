import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { graphql } from '@apollo/react-hoc';
import { Collapse, Typography, Button, Menu, Dropdown, Icon } from 'antd';
import TicketPanel from './components/ticket-panel';
import TicketsCanceled from './components/tickets-canceled';
import { LoadingBar, LoadingBarContainer, TitleContainer } from './elements';
import { GET_TICKETS } from './graphql/queries';
import { ACTIVE_TICKETS, TICKET_UPDATE } from './graphql/subscriptions';

const { Panel } = Collapse;
const { Title } = Typography;

const TicketList = ({ turnActive, setCurrent, printTicket, loading, error, data, refetchTurn }) => {
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
        const { tickets: oldTickets } = prev;
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

  if (loading) return <Title level={4}>Cargando boletas...</Title>;
  if (error) return <Title level={4}>¡No se han podido cargar las boletas!</Title>;

  const { activeTickets, refetch } = data;

  return activeTickets?.length === 0 ? (
    <Title level={4}>No hay tickets disponibles...</Title>
  ) : (
    <>
      <TitleContainer>
        <Title level={4}>Lista de boletas</Title>
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
      </TitleContainer>
      <Collapse accordion>
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
              printTicket={printTicket}
            />
          </Panel>
        ))}
        {isCancelDrawerOpen && (
          <TicketsCanceled close={() => toggleCancelDrawer(false)} refetchTickets={refetch} />
        )}
      </Collapse>
    </>
  );
};

TicketList.defaultProps = {
  loading: false,
  error: false
};

TicketList.propTypes = {
  data: PropTypes.object.isRequired,
  refetchTurn: PropTypes.func.isRequired,
  turnActive: PropTypes.object.isRequired,
  setCurrent: PropTypes.func.isRequired,
  printTicket: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  error: PropTypes.bool
};

export default graphql(GET_TICKETS, { options: () => ({ variables: { filters: {} } }) })(
  TicketList
);
