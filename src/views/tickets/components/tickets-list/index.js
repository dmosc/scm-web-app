import React, { Component } from 'react';
import { graphql } from '@apollo/react-hoc';
import { Collapse, Typography } from 'antd';
import TicketPanel from './components/ticket-panel';
import { LoadingBar, LoadingBarContainer } from './elements';
import { GET_TICKETS } from './graphql/queries';
import { ACTIVE_TICKETS, TICKET_UPDATE } from './graphql/subscriptions';

const { Panel } = Collapse;
const { Title } = Typography;

class TicketList extends Component {
  componentDidMount = () => {
    const {
      data: { subscribeToMore }
    } = this.props;

    if (!this.unsubscribeToActiveTickets)
      this.unsubscribeToActiveTickets = this.subscribeToActiveTickets(subscribeToMore);
    if (!this.unsubscribeToTicketUpdates)
      this.unsubscribeToTicketUpdates = this.subscribeToTicketUpdates(subscribeToMore);
  };

  componentWillUnmount = () => {
    this.unsubscribeToActiveTickets();
    this.unsubscribeToTicketUpdates();
  };

  subscribeToActiveTickets = subscribeToMore => {
    return subscribeToMore({
      document: ACTIVE_TICKETS,
      updateQuery: (prev, { subscriptionData: { data } }) => {
        const { activeTickets } = data;
        if (!activeTickets) return prev;

        const tickets = [...activeTickets];

        return { tickets };
      }
    });
  };

  subscribeToTicketUpdates = subscribeToMore => {
    return subscribeToMore({
      document: TICKET_UPDATE,
      updateQuery: (prev, { subscriptionData: { data } }) => {
        const { tickets: oldTickets } = prev;
        const { ticketUpdate } = data;
        if (!ticketUpdate) return prev;

        let tickets = [...oldTickets];

        for (let i = 0; i < oldTickets.length; i++)
          if (ticketUpdate.id === oldTickets[i].id)
            if (ticketUpdate.turn) tickets = tickets.splice(i, 1);
            else tickets[i] = ticketUpdate;

        return { tickets };
      }
    });
  };

  render() {
    const { turnActive, setCurrent, printTicket, loading, error, data, refetch } = this.props;

    if (loading) return <Title level={4}>Cargando boletas...</Title>;
    if (error) return <Title level={4}>¡No se han podido cargar las boletas!</Title>;

    const { tickets } = data;

    const filteredTickets = tickets?.filter(ticket => !ticket.turn);

    return filteredTickets?.length === 0 ? (
      <Title level={4}>No hay tickets disponibles...</Title>
    ) : (
      <Collapse accordion>
        {filteredTickets?.map(ticket => (
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
              refetch={refetch}
              setCurrent={setCurrent}
              printTicket={printTicket}
            />
          </Panel>
        ))}
      </Collapse>
    );
  }
}

export default graphql(GET_TICKETS, { options: () => ({ variables: { filters: {} } }) })(
  TicketList
);
