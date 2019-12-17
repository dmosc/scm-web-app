import React, {Component} from 'react';
import {Query, withApollo} from 'react-apollo';
import Layout from 'components/layout/admin';
import Container from 'components/common/container';
import {GET_TICKETS} from './graphql/queries';
import {NEW_TICKET} from './graphql/subscriptions';
import {TicketContainer} from './elements';

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

        const tickets = [newTicket, ...oldTickets];
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

              this.subscribeToTickets(subscribeToMore);

              return (
                <div>
                  {tickets.map(ticket => (
                    <TicketContainer key={ticket.folio}>
                      {ticket.folio}
                    </TicketContainer>
                  ))}
                </div>
              );
            }}
          </Query>
        </Container>
      </Layout>
    );
  }
}

export default withApollo(DashboardTickets);
