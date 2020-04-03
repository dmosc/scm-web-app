import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { withApollo } from '@apollo/react-hoc';
import periods from 'utils/enums/periods';
import { Statistic, Icon, Card, Col, Button, Select, Typography, Tag } from 'antd';
import {
  GET_TURNS,
  GET_REPORT,
  GET_MOST_RECENTLY_ENDED_TURN,
  TURN_BY_UNIQUE_ID
} from './graphql/queries';
import { FiltersContainer, ChartsContainer, InputContainer } from './elements';

const { Option } = Select;
const { Text } = Typography;

const Turns = ({ client, globalFilters }) => {
  const [loadingReport, setLoadingReport] = useState(false);
  const [loadingTurns, setLoadingTurns] = useState(false);
  const [turnUniqueId, setTurnUniqueId] = useState();
  const [turns, setTurns] = useState([]);
  const [turn, setTurn] = useState({});

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

  const downloadReport = async () => {
    setLoadingReport(true);
    const {
      data: { turnSummaryXLS }
    } = await client.query({ query: GET_REPORT, variables: { uniqueId: turn.uniqueId } });

    const start = new Date(turn.start.substring(0, turn.start.indexOf('Z') - 1));

    const link = document.createElement('a');
    link.href = encodeURI(turnSummaryXLS);
    link.download = `TURNO-${
      periods[turn.period]
    }-${start.toISOString()}-${new Date().toISOString()}.xlsx`;
    link.target = '_blank';
    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);
    setLoadingReport(false);
  };

  return (
    <>
      <FiltersContainer>
        <InputContainer>
          <Text type="secondary">ID Seleccionado</Text>
          <Select
            allowClear
            style={{ minWidth: 500 }}
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
                        {user.firstName} {user.lastName} ({uniqueId})
                      </>
                    )}
                  </Option>
                )
            )}
          </Select>
        </InputContainer>
        {turn && (
          <Button
            style={{ marginLeft: 'auto' }}
            loading={loadingReport}
            type="primary"
            icon="file-excel"
            onClick={downloadReport}
          >
            {(loadingReport && 'Generando...') || 'Descargar reporte'}
          </Button>
        )}
      </FiltersContainer>
      <Card>
        <Col span={12}>
          <Statistic
            valueStyle={{ color: '#3f8600' }}
            title="Ventas totales"
            value={0}
            suffix="MXN"
            prefix={<Icon type="rise" />}
          />
        </Col>
        <Col span={12}>
          <Statistic
            valueStyle={{ color: '#1890ff' }}
            title="Boletas"
            value={0}
            prefix={<Icon type="file-done" />}
          />
        </Col>
      </Card>
      <ChartsContainer>
        <Card title="Gráfico de pie">
          <p>Gráfica 2</p>
        </Card>
        <Card title="Distribución">
          <p>Gráfica 1</p>
        </Card>
      </ChartsContainer>
      <Card title="0 boletas">
        <p>Tabla</p>
      </Card>
    </>
  );
};

Turns.propTypes = {
  client: PropTypes.object.isRequired,
  globalFilters: PropTypes.object.isRequired
};

export default withApollo(Turns);
