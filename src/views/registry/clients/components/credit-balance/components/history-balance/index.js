import React, { useState, useEffect } from 'react';
import { Timeline, Typography, Empty, Spin } from 'antd';
import moment from 'moment';
import PropTypes from 'prop-types';
import { withApollo } from 'react-apollo';
import { GET_DEPOSIT_HISTORY } from './graphql/queries';

const { Item } = Timeline;
const { Text } = Typography;

const HistoryBalance = ({ client, currentClient }) => {
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const getHistory = async () => {
      const {
        data: { client: clientToSet }
      } = await client.query({
        query: GET_DEPOSIT_HISTORY,
        variables: { id: currentClient.id }
      });

      setHistory(
        clientToSet.depositHistory.sort(({ depositedAt: A }, { depositedAt: B }) =>
          new Date(A) < new Date(B) ? 1 : -1
        )
      );
      setLoading(false);
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
          {history.map(({ amount, depositedAt, depositedBy, newBalance }) => (
            <Item key={depositedAt.toString()}>
              <Text code>{moment(depositedAt).format('lll')}</Text>:
              <Text code>
                {depositedBy.firstName} {depositedBy.lastName}
              </Text>
              <Text type="warning">depositó</Text> a favor del balance de{' '}
              {currentClient.businessName}, la cantidad de
              <Text code>${amount}MXN</Text>, el balance resultante es:{' '}
              <Text code>${newBalance}MXN</Text>
            </Item>
          ))}
        </Timeline>
      )}
    </>
  );
};

HistoryBalance.propTypes = {
  client: PropTypes.object.isRequired,
  currentClient: PropTypes.object.isRequired
};

export default withApollo(HistoryBalance);
