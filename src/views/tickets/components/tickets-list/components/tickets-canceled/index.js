import React, { useEffect, useState } from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import { Button, Drawer, List, message, Typography } from 'antd';
import { withApollo } from 'react-apollo';
import { GET_TICKETS_CANCELED } from './graphql/queries';
import { ENABLE_TICKET } from './graphql/mutations';
import { Container } from './elements';

const { Text } = Typography;

const TicketsCanceled = ({ client, close, refetchTickets, refetchTurn }) => {
  const [disabledTickets, setDisabledTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  const updateTickets = () => {
    const getTickets = async () => {
      const end = Date.now();
      const start = end - 1000 * 60 * 60 * 24; // 24 hours
      const {
        data: { disabledTickets: disabledTicketsToSet }
      } = await client.query({
        query: GET_TICKETS_CANCELED,
        variables: { filters: { start, end } }
      });

      setDisabledTickets(disabledTicketsToSet);
      setLoading(false);
    };

    getTickets();
  };

  useEffect(updateTickets, [client]);

  const recover = async ticketId => {
    const { errors } = await client.mutate({
      mutation: ENABLE_TICKET,
      variables: { id: ticketId }
    });
    if (errors) {
      message.warning(errors[0].message);
    } else {
      message.success('El ticket se ha recuperado correctamente');
      refetchTickets();
      refetchTurn();
      close();
    }
  };

  return (
    <Drawer width={400} title="Boletas canceladas" placement="right" visible onClose={close}>
      <List
        loading={loading}
        itemLayout="horizontal"
        dataSource={disabledTickets}
        renderItem={({ id, client: ticketClient, truck, product, disabledAt }) => (
          <List.Item key={id}>
            <Container>
              <Text style={{ marginTop: 10 }} strong>
                Cliente:
              </Text>
              <Text>{ticketClient.businessName}</Text>
              <Text style={{ marginTop: 10 }} strong>
                Placas:
              </Text>
              <Text>{truck.plates}</Text>
              <Text style={{ marginTop: 10 }} strong>
                Producto solicitado:
              </Text>
              <Text>{product.name}</Text>
              <Text style={{ marginTop: 10 }} strong>
                Cancelado el:
              </Text>
              <Text>{moment(disabledAt).format('lll')}</Text>
              <Button
                onClick={() => recover(id)}
                style={{ width: '100%', marginTop: 10 }}
                size="small"
                icon="rollback"
              >
                Recuperar
              </Button>
            </Container>
          </List.Item>
        )}
      />
    </Drawer>
  );
};

TicketsCanceled.propTypes = {
  client: PropTypes.object.isRequired,
  close: PropTypes.func.isRequired,
  refetchTickets: PropTypes.func.isRequired
};

export default withApollo(TicketsCanceled);
