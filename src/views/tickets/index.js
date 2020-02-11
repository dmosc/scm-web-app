import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactDOMServer from 'react-dom/server';
import { withAuth } from 'components/providers/withAuth';
import { graphql } from '@apollo/react-hoc';
import print from 'print-js';
import mapStyles from 'react-map-styles';
import { Form, List } from 'antd';
import Container from 'components/common/container';
import ListContainer from 'components/common/list';
import TicketImageForm from './components/ticket-image-form';
import TicketSubmitForm from './components/ticket-submit-form/index';
import TurnInitForm from './components/turn-init-form';
import TurnEndForm from './components/turn-end-form';
import TicketsList from './components/tickets-list';
import { TURN_ACTIVE } from './graphql/queries';
import { TURN_UPDATE } from './graphql/subscriptions';
import TicketsContainer from './elements';

class Tickets extends Component {
  state = {
    currentTicket: null,
    currentForm: null
  };

  componentDidMount = async () => {
    const {
      data: { subscribeToMore }
    } = this.props;

    if (!this.unsubscribeToTurnUpdates)
      this.unsubscribeToTurnUpdates = this.subscribeToTurnUpdates(subscribeToMore);
  };

  componentWillUnmount = () => {
    this.unsubscribeToTurnUpdates();
  };

  subscribeToTurnUpdates = subscribeToMore => {
    return subscribeToMore({
      document: TURN_UPDATE,
      updateQuery: (prev, { subscriptionData: { data } }) => {
        const { turnUpdate } = data;
        if (!turnUpdate) return prev;

        const turnActive = { ...turnUpdate };
        return { turnActive };
      }
    });
  };

  setCurrent = (currentTicket, currentForm) => this.setState({ currentTicket, currentForm });

  printTicket = node => {
    const {
      props: { ticket }
    } = node;

    document
      .getElementById('root')
      .insertAdjacentHTML(
        'beforeend',
        `<div id="printable">${mapStyles(ReactDOMServer.renderToString(node))}</div>`
      );

    print({
      printable: 'printable',
      type: 'html',
      ignoreElements: ['skip'],
      honorColor: true,
      header: `Folio: ${ticket.folio}`,
      style:
        '@page { margin: 0; } #printable { margin: 50px; font-size: 16px; font-family: Courier; }'
    });

    const printable = document.getElementById('printable');
    printable.parentNode.removeChild(printable);
  };

  render() {
    const {
      data,
      auth: { user }
    } = this.props;

    const { currentTicket, currentForm } = this.state;

    const { loading, error, turnActive, refetch } = data;

    const TicketImageRegisterForm = Form.create({ name: 'image' })(TicketImageForm);
    const TicketSubmitRegisterForm = Form.create({ name: 'submit' })(TicketSubmitForm);
    const TurnInitRegisterForm = Form.create({ name: 'turnInit' })(TurnInitForm);
    const TurnEndRegisterForm = Form.create({ name: 'turnEnd' })(TurnEndForm);

    return (
      <TicketsContainer>
        <Container
          width="20%"
          height={turnActive && !turnActive.end ? '70vh' : null}
          justifycontent="center"
          alignitems="center"
        >
          {turnActive && !turnActive.end ? (
            <TurnEndRegisterForm turnActive={turnActive} />
          ) : (
            <TurnInitRegisterForm user={user} />
          )}
          {turnActive && !turnActive.end && (
            <ListContainer height="25vh">
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
            </ListContainer>
          )}
        </Container>
        <Container justifycontent="center" alignitems="center">
          {error ? (
            <div>¡No se han podido cargar las boletas!</div>
          ) : loading ? (
            <div>Cargando boletas...</div>
          ) : (
            <TicketsList
              turnActive={turnActive}
              setCurrent={this.setCurrent}
              printTicket={this.printTicket}
              refetch={refetch}
            />
          )}
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
      </TicketsContainer>
    );
  }
}

Tickets.propTypes = {
  data: PropTypes.object.isRequired,
  auth: PropTypes.object.isRequired
};

export default withAuth(graphql(TURN_ACTIVE)(Tickets));
