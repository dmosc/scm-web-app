import React, { useEffect, useState } from 'react';
import { withApollo } from '@apollo/react-hoc';
import PropTypes from 'prop-types';
import { Form } from 'antd';
import Container from 'components/common/container';
import TicketsSelect from './components/tickets-select';
import ClientsList from './components/clients-list';
import BillSubmit from './components/bill-submit';
import { BillsContainer } from './elements';
import {
  GET_CLIENT_TICKETS_PENDING_TO_BILL,
  GET_CLIENTS_PENDING_TICKETS_TO_BILL
} from './graphql/queries';

const Grouper = ({ client }) => {
  const [currentClient, setCurrentClient] = useState(null);
  const [type, setType] = useState('BILL');
  const [clients, setClients] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [targetTickets, setTargetTickets] = useState([]);

  useEffect(() => {
    const getClients = async () => {
      const {
        data: { clientsPendingTicketsToBill }
      } = await client.query({
        query: GET_CLIENTS_PENDING_TICKETS_TO_BILL,
        variables: { type }
      });

      const clientsToSet = clientsPendingTicketsToBill.map(
        ({ client: { id, businessName }, count }) => ({
          id,
          businessName,
          count,
          key: id
        })
      );

      setClients(clientsToSet);
    };

    getClients();
  }, [client, type]);

  useEffect(() => {
    const getData = async () => {
      if (currentClient) {
        const {
          data: { ticketsPendingToBill }
        } = await client.query({
          query: GET_CLIENT_TICKETS_PENDING_TO_BILL,
          variables: { client: currentClient, type }
        });

        const ticketsToSet = ticketsPendingToBill.map(ticket => ({ ...ticket, key: ticket.id }));

        setTickets(ticketsToSet);
      } else {
        setTickets([]);
      }
    };

    getData();
  }, [client, currentClient, type, setTickets]);

  const BillSubmitForm = Form.create({ name: 'bill-submit-form' })(BillSubmit);

  return (
    <>
      <BillsContainer>
        <Container title="Clientes con boletas pendientes" width="35%" height="75vh">
          <ClientsList
            clients={clients}
            currentClient={currentClient}
            setCurrentClient={setCurrentClient}
            setTargetTickets={setTargetTickets}
          />
        </Container>
        <div style={{ width: '100%', padding: '0px 60px 0px 0px' }}>
          <Container title="Boletas pendientes por facturar" width="100%">
            <TicketsSelect
              type={type}
              currentClient={currentClient}
              tickets={tickets}
              targetTickets={targetTickets}
              setTargetTickets={setTargetTickets}
              setType={setType}
            />
          </Container>
          <Container width="100%" height="30vh">
            <BillSubmitForm
              type={type}
              clients={clients}
              currentClient={currentClient}
              targetTickets={targetTickets}
              setCurrentClient={setCurrentClient}
              setClients={setClients}
            />
          </Container>
        </div>
      </BillsContainer>
    </>
  );
};

Grouper.propTypes = {
  client: PropTypes.object.isRequired
};

export default withApollo(Grouper);
