import React, {Component} from 'react';
import {Query, withApollo} from 'react-apollo';
import {List} from 'antd';
import {ListContainer} from './elements';
import {GET_TICKETS} from './graphql/queries';
import {ACTIVE_TICKETS} from "./graphql/subscriptions";

class TrucksList extends Component {
  componentWillUnmount = async () => {
    await this.unsubscribeToActiveTickets;
  };

  subscribeToActiveTickets = async subscribeToMore => {
    subscribeToMore({
      document: ACTIVE_TICKETS,
      updateQuery: (prev, {subscriptionData: {data}}) => {
        const {activeTickets} = data;
        if (!activeTickets) return prev;

        const tickets = [...activeTickets];

        return {tickets};
      },
    });
  };

  render() {
    return (
        <Query query={GET_TICKETS} variables={{filters: {}}}>
          {({loading, error, data, subscribeToMore}) => {
            if (loading) return <div>Cargando boletas...</div>;
            if (error) return <div>¡No se han podido cargar las boletas!</div>;

            const {tickets} = data;

            this.unsubscribeToActiveTickets = this.subscribeToActiveTickets(subscribeToMore);

            return(
                <ListContainer>
                  <List
                      loading={loading}
                      itemLayout="horizontal"
                      dataSource={tickets}
                      size="small"
                      renderItem={ticket => (
                          <List.Item>
                            <List.Item.Meta
                                title={`${ticket.truck.plates} : ${ticket.product.name}`}
                                description={`${ticket.client.businessName}`}
                            />
                          </List.Item>
                      )}
                  />
                </ListContainer>
            );
          }}
        </Query>
    );
  }
}

export default withApollo(TrucksList);
