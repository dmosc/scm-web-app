import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment-timezone';
import { format } from 'utils/functions';
import periods from 'utils/enums/periods';
import { withApollo } from 'react-apollo';
import { Typography, Select, Tag, Card, Col, Statistic, Icon, Spin, message } from 'antd';
import { FiltersContainer, InputContainer } from './elements';
import {
  GET_ROCKS,
  GET_MOST_RECENTLY_ENDED_TURN,
  TURN_BY_UNIQUE_ID,
  GET_TURNS,
  GET_TIMES
} from './graphql/queries';

const { Text } = Typography;
const { Option } = Select;

const SalesReport = ({ client, globalFilters }) => {
  const [rocks, setRocks] = useState([]);
  const [loadingTurns, setLoadingTurns] = useState(false);
  const [loading, setLoading] = useState(false);
  const [turnUniqueId, setTurnUniqueId] = useState();
  const [rockIds, setRockIds] = useState([]);
  const [turns, setTurns] = useState([]);
  const [turn, setTurn] = useState({});
  const [times, setTimes] = useState({
    max: 0,
    min: 0,
    avg: 0
  });

  useEffect(() => {
    const getTimes = async () => {
      setLoading(true);
      const {
        data: { ticketMaxTime, ticketMinTime }
      } = await client.query({
        query: GET_TIMES,
        variables: {
          date: {
            start: globalFilters.start,
            end: globalFilters.end
          },
          turnId: turn.id,
          rocks: rockIds
        }
      });
      setTimes({
        max: ticketMaxTime,
        min: ticketMinTime
      });
      setLoading(false);
    };

    getTimes();
  }, [globalFilters, turn, rockIds, client]);

  useEffect(() => {
    const getTurns = async () => {
      setLoadingTurns(true);
      const {
        data: { turns: toSet }
      } = await client.query({
        query: GET_TURNS,
        variables: {
          filters: {
            start: globalFilters.start,
            end: globalFilters.end
          }
        }
      });
      setLoadingTurns(false);
      setTurns(toSet);
    };

    getTurns();
  }, [client, globalFilters]);

  useEffect(() => {
    const getTurn = async () => {
      if (!turnUniqueId) {
        const {
          data: { turnMostRecentlyEnded }
        } = await client.query({
          query: GET_MOST_RECENTLY_ENDED_TURN
        });
        setTurn(turnMostRecentlyEnded);
      } else {
        const {
          data: { turnByUniqueId }
        } = await client.query({
          query: TURN_BY_UNIQUE_ID,
          variables: { uniqueId: turnUniqueId }
        });
        setTurn(turnByUniqueId);
      }
    };

    getTurn();
  }, [client, turnUniqueId]);

  useEffect(() => {
    const getRocks = async () => {
      try {
        const {
          data: { rocks: rocksToSet }
        } = await client.query({
          query: GET_ROCKS,
          variables: { filters: {} }
        });

        setRocks(rocksToSet);
      } catch (e) {
        message.error('¡No se han podido cargar los productos correctamente!');
      }
    };

    getRocks();
  }, [client]);

  return (
    <>
      <FiltersContainer>
        <InputContainer>
          <Text type="secondary">Turno</Text>
          <Select
            allowClear
            style={{ minWidth: 650 }}
            placeholder="ID del turno"
            onChange={value => setTurnUniqueId(value)}
            notFoundContent={null}
            value={turnUniqueId || turn.uniqueId}
            loading={loadingTurns}
          >
            {turns.map(
              ({ id, uniqueId, end, user, period }) =>
                end && (
                  <Option key={id} value={uniqueId}>
                    {!turnUniqueId && turn.uniqueId === uniqueId ? (
                      'Último turno terminado'
                    ) : (
                      <>
                        <Tag color="blue">{periods[period]}</Tag>
                        {user.firstName} {user.lastName} ({uniqueId}) (Terminado el{' '}
                        {moment(end)
                          .locale('es')
                          .format('lll')}
                        )
                      </>
                    )}
                  </Option>
                )
            )}
          </Select>
        </InputContainer>
        <InputContainer>
          <Text type="secondary">Productos</Text>
          <Select
            mode="multiple"
            allowClear
            style={{ width: 500 }}
            onChange={rockList => setRockIds(rockList)}
            placeholder="Todos"
          >
            {rocks.map(({ id, name }) => (
              <Option key={id} value={id}>
                {name}
              </Option>
            ))}
          </Select>
        </InputContainer>
      </FiltersContainer>
      {loading ? (
        <div style={{ display: 'flex', alingItems: 'center', justifyContent: 'center' }}>
          <Spin />
        </div>
      ) : (
        <Card>
          <Col span={12}>
            <Statistic
              valueStyle={{ color: '#3f8600' }}
              title="Mínimo"
              value={format.time(times.min)}
              suffix="hh:mm:ss"
              prefix={<Icon type="clock-circle" />}
            />
          </Col>
          <Col span={12}>
            <Statistic
              valueStyle={{ color: '#30CEE7' }}
              title="Máximo"
              value={format.time(times.max)}
              suffix="hh:mm:ss"
              prefix={<Icon type="clock-circle" />}
            />
          </Col>
        </Card>
      )}
    </>
  );
};

SalesReport.propTypes = {
  client: PropTypes.object.isRequired,
  globalFilters: PropTypes.object.isRequired
};

export default withApollo(SalesReport);
