import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withAuth } from 'components/providers/withAuth';
import { graphql, withApollo } from '@apollo/react-hoc';
import { Button, Empty, Form, List, message, Spin } from 'antd';
import Container from 'components/common/container';
import ListContainer from 'components/common/list';
import { printPDF } from 'utils/functions';
import TicketImageForm from './components/ticket-image-form';
import TicketSubmitForm from './components/ticket-submit-form';
import TurnInitForm from './components/turn-init-form';
import TurnEndForm from './components/turn-end-form';
import TicketsList from './components/tickets-list';
import { GET_PDF, GET_TICKET_PROMOTIONS, TURN_ACTIVE } from './graphql/queries';
import { TURN_UPDATE } from './graphql/subscriptions';
import TicketsContainer from './elements';

class Tickets extends Component {
  state = {
    currentTicket: null,
    currentTicketPromotions: [],
    currentForm: null,
    downloadingPDF: false
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

  setCurrent = async (currentTicket, currentForm) => {
    const { client } = this.props;
    const currentTicketPromotions = [];

    if (currentTicket) {
      try {
        const {
          data: { promotionsForTicket }
        } = await client.query({
          query: GET_TICKET_PROMOTIONS,
          variables: { ticket: currentTicket.id }
        });

        currentTicketPromotions.push(...promotionsForTicket);
      } catch (e) {
        message.error(e);
      }
    }

    this.setState({ currentTicket, currentTicketPromotions, currentForm });
  };

  downloadPDF = async folio => {
    const { client } = this.props;
    this.setState({ downloadingPDF: true });

    const {
      data: { ticketPDF }
    } = await client.query({
      query: GET_PDF,
      variables: {
        idOrFolio: folio
      }
    });

    await printPDF(ticketPDF);
    this.setState({ downloadingPDF: false });
  };

  render() {
    const {
      data,
      auth: { user }
    } = this.props;

    const { currentTicket, currentTicketPromotions, currentForm, downloadingPDF } = this.state;

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
                  <List.Item
                    actions={[
                      <Button
                        size="small"
                        onClick={() => this.downloadPDF(folio)}
                        disabled={downloadingPDF}
                        icon="printer"
                      />
                    ]}
                  >
                    <List.Item.Meta title={folio}/>
                  </List.Item>
                )}
              />
            </ListContainer>
          )}
        </Container>
        <Container justifycontent="center" alignitems="center">
          {error ? (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
          ) : loading ? (
            <div style={{ display: 'flex', alingItems: 'center', justifyContent: 'center' }}>
              <Spin />
            </div>
          ) : (
            <TicketsList
              turnActive={turnActive}
              setCurrent={this.setCurrent}
              refetchTurn={refetch}
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
                currentTicketPromotions={currentTicketPromotions}
                currentForm={currentForm}
              />
            ))}
        </Container>
      </TicketsContainer>
    );
  }
}

Tickets.propTypes = {
  client: PropTypes.object.isRequired,
  data: PropTypes.object.isRequired,
  auth: PropTypes.object.isRequired
};

export default withAuth(withApollo(graphql(TURN_ACTIVE)(Tickets)));
