import React, {Component} from 'react';
import {Query, withApollo} from 'react-apollo';
import {Collapse, Row, Col, Button, Icon} from 'antd';
import Layout from 'components/layout/admin';
import Container from 'components/common/container';
import {GET_TICKETS} from './graphql/queries';
import {NEW_TICKET, TICKET_UPDATE} from './graphql/subscriptions';

const {Panel} = Collapse;
class DashboardTickets extends Component {
  state = {
    tickets: [],
  };

  componentDidMount = async () => {
    const {client} = this.props;

    const {
      data: {tickets},
    } = await client.query({
      query: GET_TICKETS,
      variables: {filters: {}},
    });

    if (!tickets) return;
    this.setState({tickets});
  };

  subscribeToTickets = async subscribeToMore => {
    const {tickets: oldTickets} = this.state;
    subscribeToMore({
      document: NEW_TICKET,
      updateQuery: (prev, {subscriptionData: {data}}) => {
        const {newTicket} = data;
        if (!newTicket) return prev;

        const tickets = [...oldTickets, newTicket];
        this.setState({tickets});
      },
    });
  };

  subscribeToTicketUpdates = async subscribeToMore => {
    const {tickets: oldTickets} = this.state;
    subscribeToMore({
      document: TICKET_UPDATE,
      updateQuery: (prev, {subscriptionData: {data}}) => {
        const {ticketUpdate} = data;
        if (!ticketUpdate) return prev;

        oldTickets.forEach((ticket, i) =>
          ticket.id === ticketUpdate.id
            ? (oldTickets[i] = {...oldTickets[i], ...ticketUpdate})
            : null
        );

        const tickets = [...oldTickets];
        this.setState({tickets});
      },
    });
  };

  render() {
    const {user, collapsed, onCollapse} = this.props;
    const {tickets} = this.state;

    return (
      <Layout
        user={user}
        collapsed={collapsed}
        onCollapse={onCollapse}
        page="Boletas"
      >
        <Container justifycontent="center" alignitems="center">
          <Query query={GET_TICKETS} variables={{filters: {}}}>
            {({loading, error, subscribeToMore}) => {
              if (loading) return <div>Cargando boletas...</div>;
              if (error)
                return <div>¡No se han podido cargar las boletas!</div>;

              this.unsubscribeToTickets = this.subscribeToTickets(
                subscribeToMore
              );
              this.unsubscribeToTicketUpdates = this.subscribeToTicketUpdates(
                subscribeToMore
              );

              return (
                <Collapse accordion bordered={false}>
                  {tickets.map(ticket => (
                    <Panel
                      header={`${ticket.truck.plates}`}
                      key={ticket.id}
                      extra={
                        <div
                          style={{
                            margin: 0,
                            padding: 0,
                            width: '4vh',
                            height: '1vh',
                            background: 'lightGrey',
                          }}
                        >
                          <div
                            style={{
                              margin: 0,
                              padding: 0,
                              width: ticket.totalPrice
                                ? '4vh'
                                : ticket.outTruckImage
                                ? '3vh'
                                : '2vh',
                              height: '1vh',
                              background: 'green',
                            }}
                          />
                        </div>
                      }
                    >
                      <Row>
                        <Col span={8}>
                          <Row>
                            <b>
                              <u>CLIENTE</u>
                            </b>
                          </Row>
                          <Row>
                            <b>RAZÓN SOCIAL</b>
                            {`: ${ticket.client.businessName}`}
                          </Row>
                          <Row>
                            <b>NOMBRE</b>
                            {`: ${ticket.client.firstName}, ${ticket.client.lastName}`}
                          </Row>
                          <Row>
                            <b>DIRECCIÓN</b>
                            {`: ${ticket.client.address}`}
                          </Row>
                          <Row>
                            <b>RFC</b>
                            {`: ${ticket.client.rfc}`}
                          </Row>
                        </Col>
                        <Col span={8}>
                          <Row>
                            <b>
                              <u>CAMIÓN</u>
                            </b>
                          </Row>
                          <Row>
                            <b>CONDUCTOR</b>
                            {`: ${ticket.driver}`}
                          </Row>
                          <Row>
                            <b>PLACAS</b>
                            {`: ${ticket.truck.plates}`}
                          </Row>
                          <Row>
                            <a href={ticket.inTruckImage}>
                              <b>IMAGEN ENTRADA</b>
                            </a>
                          </Row>
                          <Row>
                            <a
                              href={
                                (ticket.outTruckImage &&
                                  ticket.outTruckImage) ||
                                '#'
                              }
                            >
                              <b>IMAGEN SALIDA</b>
                            </a>
                          </Row>
                          <Row>
                            <b>PESO</b>
                            {`: ${ticket.truck.weight}`}
                          </Row>
                          <Row>
                            <b>PESO BRUTO</b>
                            {`: ${ticket.weight}`}
                          </Row>
                          <Row>
                            <b>PESO NETO</b>
                            {`: ${ticket.totalWeight}`}
                          </Row>
                        </Col>
                        <Col span={8}>
                          <Row>
                            <b>
                              <u>PRODUCTO</u>
                            </b>
                          </Row>
                          <Row>
                            <b>TIPO</b>
                            {`: ${ticket.product.name}`}
                          </Row>
                          <Row>
                            <b>PRECIO POR TONELADA</b>
                            {`: ${ticket.product.price}`}
                          </Row>
                        </Col>
                      </Row>
                      <Row
                        style={{
                          display: 'flex',
                          justifyContent: 'flex-end',
                        }}
                      >
                        <Col
                          span={12}
                          style={{
                            display: 'flex',
                            justifyContent: 'flex-start',
                          }}
                        >
                          <Button type="primary">IMPRIMIR</Button>
                        </Col>
                        <Col
                          span={12}
                          style={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                          }}
                        >
                          <Row>
                            <b>TOTAL</b>
                            {`: ${ticket.totalPrice}`}
                          </Row>
                        </Col>
                      </Row>
                    </Panel>
                  ))}
                </Collapse>
              );
            }}
          </Query>
        </Container>
      </Layout>
    );
  }
}

export default withApollo(DashboardTickets);
