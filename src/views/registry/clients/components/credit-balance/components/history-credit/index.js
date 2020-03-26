import React, { useState, useEffect } from 'react';
import { Timeline, Typography, Empty, Spin } from 'antd';
import moment from 'moment';
import PropTypes from 'prop-types';
import { withApollo } from 'react-apollo';
import { GET_CREDIT_HISTORY } from './graphql/queries';

const { Item } = Timeline;
const { Text } = Typography;

const HistoryCredit = ({ client, currentClient }) => {
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const getHistory = async () => {
      const {
        data: { clientCreditLimitHistory: historyToSet }
      } = await client.query({
        query: GET_CREDIT_HISTORY,
        variables: { client: currentClient.id }
      });

      setLoading(false);
      setHistory(historyToSet);
    };

    getHistory();
  }, [client, currentClient.id]);

  return (
    <>
      {loading ? (
        <div style={{ display: 'flex', alingItems: 'center', justifyContent: 'center' }}>
          <Spin />
        </div>
      ) : history.length === 0 ? (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : (
        <Timeline style={{ padding: 20 }}>
          {history.map(({ id, creditLimit, addedAt, setBy }) => (
            <Item key={id}>
              <Text code>{moment(addedAt).format('lll')}</Text>:
              <Text code>
                {setBy.firstName} {setBy.lastName}
              </Text>
              <Text type="warning">aplicó</Text> un cambio al límite de crédito de{' '}
              {currentClient.businessName}, ahora es: <Text code>${creditLimit}MXN</Text>
            </Item>
          ))}
        </Timeline>
      )}
    </>
  );
};

HistoryCredit.propTypes = {
  client: PropTypes.object.isRequired,
  currentClient: PropTypes.object.isRequired
};

export default withApollo(HistoryCredit);
