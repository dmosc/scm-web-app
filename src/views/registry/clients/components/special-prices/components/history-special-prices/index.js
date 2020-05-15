import React, { useState, useEffect } from 'react';
import { Timeline, Typography, Empty, Spin, Select } from 'antd';
import moment from 'moment-timezone';
import PropTypes from 'prop-types';
import { withApollo } from 'react-apollo';
import { GET_HISTORY_PRICES, GET_ROCKS } from './graphql/queries';

const { Item } = Timeline;
const { Text } = Typography;
const { Option } = Select;

const HistorySpecialPrices = ({ client, currentClient }) => {
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [rocks, setRocks] = useState([]);
  const [rock, setRock] = useState();

  useEffect(() => {
    const getHistory = async () => {
      const {
        data: { clientPriceHistoryByClient: historyToSet }
      } = await client.query({
        query: GET_HISTORY_PRICES,
        variables: { client: currentClient.id, rock }
      });

      setLoading(false);
      setHistory(historyToSet);
    };

    getHistory();
  }, [client, rock, currentClient.id]);

  useEffect(() => {
    const getRocks = async () => {
      const {
        data: { rocks: rocksToSet }
      } = await client.query({
        query: GET_ROCKS,
        variables: { filters: {} }
      });

      setRocks(rocksToSet);
    };

    getRocks();
  }, [client]);

  return (
    <>
      <Select
        allowClear
        placeholder="Filtra por producto"
        style={{ padding: 20, width: '100%' }}
        value={rock}
        onChange={setRock}
      >
        {rocks.map(({ id, name }) => (
          <Option key={IDBCursorWithValue} value={id}>
            {name}
          </Option>
        ))}
      </Select>
      {loading ? (
        <div style={{ display: 'flex', alingItems: 'center', justifyContent: 'center' }}>
          <Spin />
        </div>
      ) : history.length === 0 ? (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : (
        <Timeline style={{ padding: 20 }}>
          {history.map(({ id, rock: listRock, price, addedAt, setBy, noSpecialPrice }) => {
            if (noSpecialPrice) {
              return (
                <Item key={id}>
                  <Text code>{moment(addedAt).format('lll')}</Text>:
                  <Text code>
                    {setBy.firstName} {setBy.lastName}
                  </Text>
                  <Text type="danger">retiró</Text> el precio especial sobre sobre el producto
                  <Text code>{listRock.name}</Text>
                </Item>
              );
            }
            return (
              <Item key={id}>
                <Text code>{moment(addedAt).format('lll')}</Text>:
                <Text code>
                  {setBy.firstName} {setBy.lastName}
                </Text>
                <Text type="warning">aplicó</Text> el precio especial de{' '}
                <Text code>${price}MXN</Text> sobre el producto
                <Text code>{listRock.name}</Text>
              </Item>
            );
          })}
        </Timeline>
      )}
    </>
  );
};

HistorySpecialPrices.propTypes = {
  client: PropTypes.object.isRequired,
  currentClient: PropTypes.object.isRequired
};

export default withApollo(HistorySpecialPrices);
