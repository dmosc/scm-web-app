import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { printPDF } from 'utils/functions';
import { withApollo } from 'react-apollo';
import { useAuth } from 'components/providers/withAuth';
import {
  Button,
  Col,
  Divider,
  message,
  Modal,
  Row,
  Select,
  Statistic,
  Tabs,
  Typography
} from 'antd';
import { Actions } from './elements';
import { ADD_TICKET_TO_TURN, DISABLE_TICKET, SET_STORE_TO_TICKET } from './graphql/mutations';
import { GET_PDF } from './graphql/queries';

const { confirm } = Modal;
const { Option } = Select;
const { TabPane } = Tabs;
const { Text, Title, Paragraph } = Typography;

const TicketPanel = ({ turn, refetchTickets, refetchTurn, client, ticket, setCurrent }) => {
  const [tab, setTab] = useState('client');
  const [downloadingPDF, setDownloadingPDF] = useState(false);

  const { isAdmin, isManager, isSupport, isCollectorAux } = useAuth();

  const addTicketToTurn = async ticketToAdd => {
    const { id } = turn;

    try {
      await client.mutate({
        mutation: ADD_TICKET_TO_TURN,
        variables: { turn: { id, ticket: ticketToAdd } }
      });

      refetchTickets();
      refetchTurn();
    } catch (e) {
      message.error(e.toString());
    }
  };

  const setStoreToTicket = async store => {
    try {
      const {
        data: { ticketSetStore },
        errors
      } = await client.mutate({
        mutation: SET_STORE_TO_TICKET,
        variables: { ticket: ticket.id, store }
      });

      if (errors) {
        message.success('Ha habido un error durante la selección de la sucursal!');
        return;
      }

      if (ticketSetStore) {
        message.success('La sucursal ha sido seleccionada exitosamente!');
      }

      refetchTickets();
      refetchTurn();
    } catch (e) {
      message.error(e.message);
    }
  };

  const handleCancel = ticketId => {
    confirm({
      title: '¿Quieres cancelar esta boleta?',
      content:
        'Tendrás 24 horas para recuperar la boleta en la sección de boletas canceladas, después de eso, se perderá completamente',
      okText: 'Cancelar boleta',
      cancelText: 'Regresar',
      okType: 'danger',
      onOk: async () => {
        try {
          await client.mutate({
            mutation: DISABLE_TICKET,
            variables: { id: ticketId }
          });

          refetchTickets();

          message.success('La boleta ha sido cancelada correctamente');
        } catch (e) {
          message.error('Ha habido un error confirmando el cambio del producto');
        }
      },
      onCancel: () => {}
    });
  };

  const downloadPDF = async () => {
    setDownloadingPDF(true);
    const {
      data: { ticketPDF }
    } = await client.query({
      query: GET_PDF,
      variables: {
        idOrFolio: ticket.id
      }
    });

    await printPDF(ticketPDF);

    setDownloadingPDF(false);
  };

  const { address } = ticket.client;

  return (
    <>
      <Tabs
        style={{ padding: 10 }}
        activeKey={tab}
        animated={false}
        defaultActiveKey="client"
        onChange={setTab}
      >
        <TabPane tab="Cliente" key="client">
          <Row>
            <Col span={24}>
              <Text type="secondary">Razón social</Text>
              <Title style={{ margin: 0 }} level={4}>
                {ticket.client.businessName}
              </Title>
            </Col>
          </Row>
          <Row style={{ marginTop: 10 }}>
            <Col span={12}>
              <Text type="secondary">Dirección</Text>
              <Paragraph code>
                {address.street
                  ? `${address.street} #${address.extNumber} ${address.municipality}, ${address.state}`
                  : 'N/A'}
              </Paragraph>
            </Col>
            <Col span={6}>
              <Text type="secondary">Código postal</Text>
              <Paragraph code>{ticket.client.address?.zipcode || 'N/A'}</Paragraph>
            </Col>
            <Col span={6}>
              <Text type="secondary">Balance</Text>
              <Paragraph code type={ticket.client.balance < 0 ? 'danger' : undefined}>
                {ticket.client.balance.toLocaleString('es-MX')} MXN
              </Paragraph>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="Camión" key="truck">
          <Row>
            <Col span={24}>
              <Text type="secondary">Conductor</Text>
              <Title style={{ margin: 0 }} level={4}>
                {ticket.driver || 'N/A'}
              </Title>
            </Col>
          </Row>
          <Row style={{ marginTop: 10 }}>
            <Col span={12}>
              <Text type="secondary">Placas</Text>
              <Paragraph code>{ticket.truck.plates}</Paragraph>
            </Col>
            <Col span={12}>
              <Paragraph style={{ marginBottom: 3 }} type="secondary">
                Imágenes entrada
              </Paragraph>
              <Button
                icon="login"
                style={{ marginRight: 10 }}
                size="small"
                type="primary"
                onClick={() => window.open(ticket.inTruckImageLeft, '_blank')}
                disabled={!ticket.inTruckImageLeft}
              >
                Izquierda
              </Button>
              <Button
                icon="login"
                style={{ marginRight: 10 }}
                size="small"
                type="primary"
                onClick={() => window.open(ticket.inTruckImage, '_blank')}
                disabled={!ticket.inTruckImage}
              >
                Arriba
              </Button>
              <Button
                icon="login"
                style={{ marginRight: 10 }}
                size="small"
                type="primary"
                onClick={() => window.open(ticket.inTruckImageRight, '_blank')}
                disabled={!ticket.inTruckImageRight}
              >
                Derecha
              </Button>
              <Paragraph style={{ marginBottom: 3 }} type="secondary">
                Imágenes salida
              </Paragraph>
              <Button
                size="small"
                icon="logout"
                type="primary"
                onClick={() => window.open(ticket.outTruckImage, '_blank')}
                disabled={!ticket.outTruckImage}
              >
                Frente
              </Button>
              <Button
                size="small"
                icon="logout"
                type="primary"
                onClick={() => window.open(ticket.outTruckImageBack, '_blank')}
                disabled={!ticket.outTruckImageBack}
              >
                Atrás
              </Button>
            </Col>
          </Row>
        </TabPane>

        {ticket.product && (
          <TabPane tab="Producto" key="product">
            <Row>
              <Col span={24}>
                <Text type="secondary">Producto</Text>
                <Title style={{ margin: 0 }} level={4}>
                  {ticket.product.name}
                </Title>
              </Col>
            </Row>
            <Row style={{ marginTop: 10 }}>
              <Col span={12}>
                <Text type="secondary">Peso total</Text>
                <Paragraph code>
                  {ticket.totalWeight ? `${ticket.totalWeight} tons` : 'N/A'}
                </Paragraph>
              </Col>
              <Col span={6}>
                <Text type="secondary">Peso bruto</Text>
                <Paragraph code>{ticket.weight ? `${ticket.weight} tons` : 'N/A'}</Paragraph>
              </Col>
              <Col span={6}>
                <Text type="secondary">Peso del camión</Text>
                <Paragraph code>{ticket.truck.weight} tons</Paragraph>
              </Col>
            </Row>
          </TabPane>
        )}
      </Tabs>
      {ticket.totalPrice && (
        <>
          <Divider style={{ margin: 0 }} />
          <Statistic
            style={{ margin: '10px 0', marginLeft: 'auto', width: 'fit-content' }}
            title="Total"
            suffix="MXN"
            value={`$${ticket.totalPrice}`}
          />
        </>
      )}

      <Actions id="skip">
        <Button
          icon="camera"
          size="small"
          type="danger"
          onClick={() => setCurrent(ticket, 'image')}
        >
          Tomar foto
        </Button>
        <Button
          size="small"
          type="primary"
          disabled={!ticket.outTruckImage || ticket.totalPrice}
          onClick={() => setCurrent(ticket, 'submit')}
          icon="money-collect"
        >
          Cobrar
        </Button>
        <Button
          size="small"
          onClick={downloadPDF}
          disabled={!ticket.totalPrice || downloadingPDF}
          type="primary"
          icon="printer"
        >
          Imprimir
        </Button>
        <Button
          size="small"
          type="dashed"
          disabled={!ticket.totalPrice}
          onClick={() => addTicketToTurn(ticket.id)}
          icon="plus"
        >
          Agregar a turno
        </Button>
        {(isAdmin || isManager || isSupport || isCollectorAux) && (
          <Button
            style={{ marginLeft: 'auto' }}
            size="small"
            onClick={() => handleCancel(ticket.id)}
            type="danger"
            ghost
            icon="close"
          >
            Cancelar
          </Button>
        )}
      </Actions>
      {ticket.client.stores.length > 0 && (
        <Select
          id="skip"
          style={{ width: 250, marginTop: 10 }}
          placeholder="Seleccionar sucursal"
          onChange={store => setStoreToTicket(store)}
          defaultValue={ticket.store?.id}
          size="small"
          allowClear
        >
          {ticket.client.stores.map(store => (
            <Option key={store.id} value={store.id}>
              {store.name}
            </Option>
          ))}
        </Select>
      )}
    </>
  );
};

TicketPanel.propTypes = {
  ticket: PropTypes.object.isRequired,
  client: PropTypes.object.isRequired,
  turn: PropTypes.object.isRequired,
  refetchTickets: PropTypes.func.isRequired,
  refetchTurn: PropTypes.func.isRequired,
  setCurrent: PropTypes.func.isRequired
};

export default withApollo(TicketPanel);
