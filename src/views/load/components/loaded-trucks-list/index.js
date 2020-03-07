import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { graphql } from '@apollo/react-hoc';
import { List } from 'antd';
import { ListContainer } from './elements';
import { GET_LOADED_TICKETS } from './graphql/queries';
import { LOADED_TICKETS } from './graphql/subscriptions';

const LoadedTruckList = ({ data }) => {
  const { subscribeToMore, loading, error, loadedTickets: tickets } = data;

  useEffect(() => {
    let unsubscribeToLoadedTickets;

    const subscribeToLoadedTickets = () => {
      return subscribeToMore({
        document: LOADED_TICKETS,
        updateQuery: (prev, { subscriptionData }) => {
          const { loadedTickets } = subscriptionData.data;
          if (!loadedTickets) return prev;

          return { loadedTickets: [...loadedTickets] };
        }
      });
    };

    if (!unsubscribeToLoadedTickets) unsubscribeToLoadedTickets = subscribeToLoadedTickets();

    return () => unsubscribeToLoadedTickets();
  }, [subscribeToMore]);

  return (
    <ListContainer>
      {error ? (
        <div>¡No se han podido cargar los camiones!</div>
      ) : loading ? (
        <div>Cargando camiones cargados...</div>
      ) : (
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
      )}
    </ListContainer>
  );
};

LoadedTruckList.propTypes = {
  data: PropTypes.object.isRequired
};

export default graphql(GET_LOADED_TICKETS, { options: () => ({ variables: { filters: {} } }) })(
  LoadedTruckList
);
