import React, {Component} from 'react';
import {Query, withApollo} from 'react-apollo';
import ReactDOMServer from 'react-dom/server';
import print from 'print-js';
import mapStyles from 'react-map-styles';
import {Form, Collapse} from 'antd';
import Layout from 'components/layout/admin';
import Container from 'components/common/container';
import TicketImageForm from './components/ticket-image-form';
import TicketSubmitForm from './components/ticket-submit-form/index';
import TicketPanel from './components/ticket-panel';
import {LoadingBarContainer, LoadingBar} from './elements';
import {GET_TICKETS} from './graphql/queries';
import {NEW_TICKET, TICKET_UPDATE} from './graphql/subscriptions';

const {Panel} = Collapse;
class DashboardTickets extends Component {
  state = {
    tickets: [],
    currentTicket: null,
    currentForm: null,
  };

  componentDidMount = async () => {
    const {client} = this.props;

    try {
      const {
        data: {tickets},
      } = await client.query({
        query: GET_TICKETS,
        variables: {filters: {}},
      });

      if (!tickets) return;
      this.setState({tickets});
    } catch (e) {
      console.log(e);
    }
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

  render() {
    const {user, collapsed, onCollapse} = this.props;
    const {tickets, currentTicket, currentForm} = this.state;

    const TicketImageRegisterForm = Form.create({name: 'image'})(
      TicketImageForm
    );
    const TicketSubmitRegisterForm = Form.create({name: 'submit'})(
      TicketSubmitForm
    );

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
                      key={ticket.id}
                      header={`${ticket.truck.plates}`}
                      extra={
                        <LoadingBarContainer>
                          <LoadingBar
                            totalPrice={ticket.totalPrice}
                            outTruckImage={ticket.outTruckImage}
                          />
                        </LoadingBarContainer>
                      }
                    >
                      <TicketPanel
                        ticket={ticket}
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
