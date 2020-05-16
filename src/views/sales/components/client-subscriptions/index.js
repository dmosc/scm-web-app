import React, { useEffect, useState } from 'react';
import { withApollo } from '@apollo/react-hoc';
import PropTypes from 'prop-types';
import { message, Tabs, Tag, Typography } from 'antd';
import { Card, ListContainer, TitleContainer } from './elements';
import { GET_CLIENT_SUBSCRIPTIONS, GET_SUBSCRIPTION_WARNING_COUNT } from './graphql/queries';
import SubscriptionsList from './components/subscriptions-list';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const ClientSubscriptions = ({ client }) => {
  const [loading, setLoading] = useState(false);
  const [clientSubscriptions, setClientSubscriptions] = useState([]);
  const [clientSubscriptionWarningCount, setClientSubscriptionWarningCount] = useState(0);
  const [filters, setFilters] = useState({
    status: 'WITH_NO_WARNING'
  });

  useEffect(() => {
    const getPriceRequests = async () => {
      const { data, errors } = await client.query({
        query: GET_CLIENT_SUBSCRIPTIONS,
        variables: { filters }
      });

      if (errors) {
        message.error('Ocurrió un error obteniendo las suscripciones');
      } else {
        setClientSubscriptions(data.clientSubscriptions);
      }

      setLoading(false);
    };

    getPriceRequests();
  }, [client, filters, loading]);

  useEffect(() => {
    const getClientSubscriptionWarningCount = async () => {
      const { data, errors } = await client.query({ query: GET_SUBSCRIPTION_WARNING_COUNT });

      if (!errors) {
        setClientSubscriptionWarningCount(data.clientSubscriptionWarningCount);
      } else {
        message.error('Ha habido un error cargando las alertas!');
      }
    };

    getClientSubscriptionWarningCount();
  }, [client, filters, clientSubscriptionWarningCount]);

  return (
    <>
      <ListContainer>
        <TitleContainer>
          <Title level={3}>Seguimiento de clientes</Title>
        </TitleContainer>
        <Card>
          <Tabs
            animated={false}
            onChange={status => setFilters({ status })}
            defaultActiveKey="PENDING"
          >
            <TabPane tab="Activas" key="WITH_NO_WARNING" />
            <TabPane
              key="WITH_WARNING"
              tab={
                <Text>
                  Alerta
                  <Tag color="#108EE9" style={{ marginLeft: 20 }}>
                    {clientSubscriptionWarningCount}
                  </Tag>
                </Text>
              }
            />
          </Tabs>
          <SubscriptionsList
            loading={loading}
            updateFather={() => setLoading(true)}
            setClientSubscriptions={setClientSubscriptions}
            clientSubscriptions={clientSubscriptions}
          />
        </Card>
      </ListContainer>
    </>
  );
};

ClientSubscriptions.propTypes = {
  client: PropTypes.object.isRequired
};

export default withApollo(ClientSubscriptions);
