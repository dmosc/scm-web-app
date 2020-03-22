import React, { useEffect, useState } from 'react';
import { withApollo } from '@apollo/react-hoc';
import PropTypes from 'prop-types';
import Container from 'components/common/container';
import TicketsSelect from './components/tickets-select';
import ClientsList from './components/clients-list';
import { BillsContainer } from './elements';
import BillSubmit from './components/bill-submit';
import { GET_CLIENT_TICKETS_PENDING_TO_BILL } from './graphql/queries';

const Bills = ({ client }) => {
  const [currentClient, setCurrentClient] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [targetTickets, setTargetTickets] = useState([]);

  useEffect(() => {
    const getData = async () => {
      if (currentClient) {
        const {
          data: { ticketsPendingToBill }
        } = await client.query({
          query: GET_CLIENT_TICKETS_PENDING_TO_BILL,
          variables: { client: currentClient }
        });

        const ticketsToSet = ticketsPendingToBill.map(ticket => ({ ...ticket, key: ticket.id }));

        setTickets(ticketsToSet);
      } else {
        setTickets([]);
      }
    };

    getData();
  }, [client, currentClient, setTickets]);

  return (
    <>
      <BillsContainer>
        <Container title="Clientes con boletas pendientes" width="35%" height="75vh">
          <ClientsList currentClient={currentClient} setCurrentClient={setCurrentClient} />
        </Container>
        <div style={{ width: '100%', padding: '0px 60px 0px 0px' }}>
          <Container title="Boletas pendientes por facturar" width="100%">
            <TicketsSelect
              currentClient={currentClient}
              tickets={tickets}
              targetTickets={targetTickets}
              setTargetTickets={setTargetTickets}
            />
          </Container>
          <Container width="60%" height="35vh">
            <BillSubmit
              currentClient={currentClient}
              tickets={tickets}
              targetTickets={targetTickets}
            />
          </Container>
        </div>
      </BillsContainer>
    </>
  );
};

Bills.propTypes = {
  client: PropTypes.object.isRequired
};

export default withApollo(Bills);
