import React, {Component} from 'react';
import {Query, withApollo} from 'react-apollo';
import ReactDOMServer from 'react-dom/server';
import print from 'print-js';
import mapStyles from 'react-map-styles';
import {Form, Collapse, List} from 'antd';
import Layout from 'components/layout/admin';
import Container from 'components/common/container';
import ListContainer from "components/common/list";
import TicketImageForm from './components/ticket-image-form';
import TicketSubmitForm from './components/ticket-submit-form/index';
import TicketPanel from './components/ticket-panel';
import {LoadingBarContainer, LoadingBar} from './elements';
import TurnInitForm from "./components/turn-init-form";
import TurnEndForm from "./components/turn-end-form";
import {GET_TICKETS, TURN_ACTIVE} from './graphql/queries';
import {NEW_TICKET, TICKET_UPDATE, TURN_UPDATE} from './graphql/subscriptions';

const {Panel} = Collapse;

class DashboardTickets extends Component {
  state = {
    currentTicket: null,
    currentForm: null,
    turnActive: null,
  };

  componentDidMount = async () => {
    const {client} = this.props;

    try {
      const [
          {
            data: {tickets}
          },
          {
            data: {turnActive}
          }
      ] = await Promise.all([
        client.query({
          query: GET_TICKETS,
          variables: {filters: {}},
        }),
        client.query({
          query: TURN_ACTIVE
        })
      ]);

      if (!tickets) return;
      this.setState({tickets, turnActive});
    } catch (e) {
      console.log(e);
    }
  };

  componentWillUnmount = () => {
    this.unsubscribeToTickets();
    this.unsubscribeToTicketUpdates();
    this.unsubscribeToTurnUpdates();
  };

  subscribeToTickets = subscribeToMore => {
    return subscribeToMore({
      document: NEW_TICKET,
      updateQuery: (prev, {subscriptionData: {data}}) => {
        const {tickets: oldTickets} = prev;
        const {newTicket} = data;
        if (!newTicket) return prev;

        for (let i = 0; i < oldTickets.length; i++)
          if (newTicket.id === oldTickets[i].id) return prev;

        const tickets = [...oldTickets, newTicket];

        return {tickets};
      },
    });
  };

  subscribeToTicketUpdates = subscribeToMore => {
    return subscribeToMore({
      document: TICKET_UPDATE,
      updateQuery: (prev, {subscriptionData: {data}}) => {
        const {tickets: oldTickets} = prev;
        const {ticketUpdate} = data;
        if (!ticketUpdate) return prev;

        let tickets = [...oldTickets];

        for (let i = 0; i < oldTickets.length; i++)
          if (ticketUpdate.id === oldTickets[i].id) tickets[i] = ticketUpdate;

        return {tickets};
      }
    });
  };

  subscribeToTurnUpdates = subscribeToMore => {
    return subscribeToMore({
      document: TURN_UPDATE,
      updateQuery: (prev, {subscriptionData: {data}}) => {
        const {turnUpdate} = data;
        if (!turnUpdate) return prev;

        const turnActive = {...turnUpdate};

        this.setState({turnActive});
        return {turnActive};
      },
    });
  };

  setCurrent = (currentTicket, currentForm) =>
    this.setState({currentTicket, currentForm});

  printTicket = node => {
    const {
      props: {ticket},
    } = node;

    document
      .getElementById('root')
      .insertAdjacentHTML(
        'beforeend',
        `<div id="printable">${mapStyles(
          ReactDOMServer.renderToString(node)
        )}</div>`
      );

    print({
      printable: 'printable',
      type: 'html',
      ignoreElements: ['skip'],
      honorColor: true,
      header: `Folio: ${ticket.folio}`,
      style:
        '@page { margin: 0; } #printable { margin: 50px; font-size: 16px; font-family: Courier; }',
    });

    const printable = document.getElementById('printable');
    printable.parentNode.removeChild(printable);
  };

  onTurnUpdate = turnActive => this.setState({turnActive});

  render() {
    const {user, collapsed, onCollapse} = this.props;
    const {currentTicket, currentForm, turnActive} = this.state;

    const TicketImageRegisterForm = Form.create({name: 'image'})(
      TicketImageForm
    );
    const TicketSubmitRegisterForm = Form.create({name: 'submit'})(
      TicketSubmitForm
    );
    const TurnInitRegisterForm = Form.create({name: 'turnInit'})(TurnInitForm);
    const TurnEndRegisterForm = Form.create({name: 'turnEnd'})(TurnEndForm);

    return (
      <Layout
        user={user}
        collapsed={collapsed}
        onCollapse={onCollapse}
        page="Boletas"
      >
        <Container width="20%" height={turnActive && !turnActive.end  ? "70vh" : null} justifycontent="center" alignitems="center">
          {turnActive && !turnActive.end ? <TurnEndRegisterForm turnActive={turnActive}/> : <TurnInitRegisterForm user={user}/>}
          {turnActive && !turnActive.end && <ListContainer height="25vh">
            <List
                loading={false}
                itemLayout="horizontal"
                dataSource={turnActive.folios}
                size="small"
                renderItem={folio => (
                    <List.Item>
                      <List.Item.Meta title={folio} />
                    </List.Item>
                )}
            />
          </ListContainer>}
        </Container>
        <Container justifycontent="center" alignitems="center">
          <Query query={GET_TICKETS} variables={{filters: {}}}>
            {({loading, error, data, refetch, subscribeToMore}) => {
              if (loading) return <div>Cargando boletas...</div>;
              if (error) return <div>¡No se han podido cargar las boletas!</div>;

              const {tickets} = data;

              if(!this.unsubscribeToTickets) this.unsubscribeToTickets = this.subscribeToTickets(subscribeToMore);
              if(!this.unsubscribeToTicketUpdates) this.unsubscribeToTicketUpdates = this.subscribeToTicketUpdates(subscribeToMore);
              if(!this.unsubscribeToTurnUpdates) this.unsubscribeToTurnUpdates = this.subscribeToTurnUpdates(subscribeToMore);

              return (
                  tickets.length === 0 ?
                    <div>No hay tickets disponibles</div> :
                    <Collapse accordion bordered={false}>
                      {tickets.filter(ticket => !ticket.turn).map(ticket => (
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
                                onTurnUpdate={this.onTurnUpdate}
                                refetch={refetch}
                                setCurrent={this.setCurrent}
                                printTicket={this.printTicket}
                            />
                          </Panel>
                      ))}
                    </Collapse>
              );
            }}
          </Query>
          {(currentTicket && currentForm === 'image' && (
            <TicketImageRegisterForm
              user={user}
              setCurrent={this.setCurrent}
              currentTicket={currentTicket}
              currentForm={currentForm}
            />
          )) ||
            (currentForm === 'submit' && (
              <TicketSubmitRegisterForm
                setCurrent={this.setCurrent}
                currentTicket={currentTicket}
                currentForm={currentForm}
              />
            ))}
        </Container>
      </Layout>
    );
  }
}

export default withApollo(DashboardTickets);
