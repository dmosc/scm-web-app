import React, { useEffect, useState } from 'react';
import moment from 'moment/min/moment-with-locales';
import PropTypes from 'prop-types';
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { withApollo } from '@apollo/react-hoc';
import periods from 'utils/enums/periods';
import {
  Button,
  Card,
  Col,
  Collapse,
  Icon,
  Row,
  Select,
  Spin,
  Statistic,
  Tag,
  Typography
} from 'antd';
import {
  GET_MOST_RECENTLY_ENDED_TURN,
  GET_REPORT,
  GET_TURN_SUMMARY,
  GET_TURNS,
  TURN_BY_UNIQUE_ID
} from './graphql/queries';
import { ChartsContainer, FiltersContainer, InputContainer } from './elements';

const { Panel } = Collapse;
const { Option } = Select;
const { Title, Paragraph, Text } = Typography;

const Turns = ({ client, globalFilters }) => {
  const [loading, setLoading] = useState(true);
  const [ticketType, setTicketType] = useState();
  const [loadingReport, setLoadingReport] = useState(false);
  const [loadingTurns, setLoadingTurns] = useState(false);
  const [turnUniqueId, setTurnUniqueId] = useState();
  const [turns, setTurns] = useState([]);
  const [turn, setTurn] = useState({});
  const [ticketCount, setTicketCount] = useState(0);
  const [summary, setSummary] = useState({});

  useEffect(() => {
    const getTurn = async () => {
      setLoading(true);
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
        setLoading(false);
      }
    };

    getTurn();
  }, [client, turnUniqueId]);

  useEffect(() => {
    if (turn.uniqueId) {
      const getSummary = async () => {
        setLoading(true);
        const {
          data: { turnSummary }
        } = await client.query({
          query: GET_TURN_SUMMARY,
          variables: { uniqueId: turn.uniqueId, ticketType }
        });
        const ticketCountToSet = turnSummary.clients.reduce((total, { count }) => {
          // eslint-disable-next-line no-param-reassign
          total += count;
          return total;
        }, 0);

        setSummary(turnSummary);
        setTicketCount(ticketCountToSet);
        setLoading(false);
      };

      getSummary();
    }
  }, [client, turn.uniqueId, ticketType]);

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
    } = await client.query({
      query: GET_REPORT,
      variables: { uniqueId: turn.uniqueId, ticketType }
    });

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
        <InputContainer>
          <Text type="secondary">Tipo de boleta</Text>
          <Select
            allowClear
            style={{ minWidth: 200 }}
            placeholder="Selecciona el tipo"
            onChange={value => setTicketType(value)}
            value={ticketType}
          >
            <Option value="CREDIT">Crédito</Option>
            <Option value="CASH">Contado</Option>
          </Select>
        </InputContainer>
        {turn && (
          <Button
            style={{ marginLeft: 'auto', marginTop: 20 }}
            loading={loadingReport}
            type="primary"
            icon="file-excel"
            onClick={downloadReport}
          >
            {(loadingReport && 'Generando...') || 'Descargar reporte'}
          </Button>
        )}
      </FiltersContainer>
      {loading ? (
        <div style={{ display: 'flex', alingItems: 'center', justifyContent: 'center' }}>
          <Spin />
        </div>
      ) : (
        <>
          <Card>
            <Title level={4}>Turno: {turn.uniqueId}</Title>
            <Col span={12}>
              <Paragraph style={{ margin: 0 }} type="secondary">
                Operador:
              </Paragraph>
              <Paragraph style={{ margin: 0 }}>
                {turn?.user?.firstName} {turn?.user?.lastName}{' '}
              </Paragraph>
              <Paragraph style={{ margin: 0 }} type="secondary">
                Periodo:
              </Paragraph>
              <Paragraph style={{ margin: 0 }}>
                <Tag color="blue">{periods[turn.period]}</Tag>
              </Paragraph>
            </Col>
            <Col span={12}>
              <Paragraph style={{ margin: 0 }} type="secondary">
                Inicio:
              </Paragraph>
              <Paragraph style={{ margin: 0 }}>
                {moment(turn.start)
                  .locale('es')
                  .format('LLLL')}
              </Paragraph>
              <Paragraph style={{ margin: 0 }} type="secondary">
                Término:
              </Paragraph>
              <Paragraph style={{ margin: 0 }}>
                {moment(turn.end)
                  .locale('es')
                  .format('LLLL')}
              </Paragraph>
            </Col>
          </Card>
          <Card>
            <Col span={6}>
              <Statistic
                valueStyle={{ color: '#3f8600' }}
                title="Ventas"
                value={summary?.total?.toFixed(2)}
                suffix="MXN"
                prefix={<Icon type="rise" />}
              />
            </Col>
            <Col span={6}>
              <Statistic
                valueStyle={{ color: '#30CEE7' }}
                title="Contado"
                value={`$${summary?.upfront?.toFixed(2)}`}
                suffix="MXN"
              />
            </Col>
            <Col span={6}>
              <Statistic
                valueStyle={{ color: '#FFAB00' }}
                title="Crédito"
                value={`$${summary?.credit?.toFixed(2)}`}
                suffix="MXN"
              />
            </Col>
            <Col span={6}>
              <Statistic
                valueStyle={{ color: '#1890ff' }}
                title="Boletas"
                value={ticketCount}
                prefix={<Icon type="file-done" />}
              />
            </Col>
          </Card>
          <ChartsContainer>
            <Card title="Gasto por cliente">
              <ResponsiveContainer height={220}>
                <BarChart
                  height={220}
                  data={summary?.clients?.map(({ info, tickets }) => {
                    let credit = 0;
                    let cash = 0;

                    tickets.forEach(({ totalPrice, credit: isCredit }) => {
                      if (isCredit) credit += totalPrice;
                      else cash += totalPrice;
                    });

                    return {
                      name: info.businessName,
                      credit,
                      cash
                    };
                  })}
                  outerRadius={60}
                >
                  <XAxis tick={false} dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar name="Crédito" stackId="a" fill="#1890ff" dataKey="credit" />
                  <Bar name="Contado" stackId="a" fill="#3f8600" dataKey="cash" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
            <Card title="Distribución porcentual de crédito vs contado">
              <ResponsiveContainer height={220}>
                <PieChart height={220}>
                  <Pie
                    dataKey="value"
                    isAnimationActive={true}
                    data={[
                      {
                        name: 'credit',
                        value: (summary.credit / summary.total).toFixed(4) * 100
                      },
                      {
                        name: 'cash',
                        value: (summary.upfront / summary.total).toFixed(4) * 100
                      }
                    ]}
                    outerRadius={60}
                    label={true}
                  >
                    <Cell name="Contado" key="cash" fill="#FFAB00" />
                    <Cell name="Crédito" key="credit" fill="#30CEE7" />
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </ChartsContainer>
          <Card title={`${summary?.clients?.length || 0} clientes atendidos`}>
            <Collapse
              bordered={false}
              expandIcon={({ isActive }) => <Icon type="caret-right" rotate={isActive ? 90 : 0} />}
            >
              {summary.clients?.map(({ info, count, tickets }) => (
                <Panel key={info.id} header={info.businessName} extra={count}>
                  <Collapse
                    expandIcon={({ isActive }) => (
                      <Icon type="caret-right" rotate={isActive ? 90 : 0} />
                    )}
                  >
                    {tickets.map(ticket => (
                      <Panel key={ticket.id} header={ticket.folio} extra={`$${ticket.totalPrice}`}>
                        <Row style={{ margin: 5, padding: 10 }} gutter={{ xs: 8, sm: 16, md: 24 }}>
                          <Col span={6}>
                            <Statistic
                              valueStyle={{ color: '#FF4F64' }}
                              title="Peso neto"
                              value={ticket.totalWeight.toFixed(2)}
                              suffix="tons"
                              prefix={<Icon type="car" />}
                            />
                          </Col>
                          <Col span={6}>
                            <Statistic
                              valueStyle={{ color: '#1890ff' }}
                              title="Subtotal"
                              value={(ticket.totalPrice - ticket.tax).toFixed(2)}
                              suffix="MXN"
                              prefix={<Icon type="check-circle" />}
                            />
                          </Col>
                          <Col span={6}>
                            <Statistic
                              valueStyle={{ color: '#FFAB00' }}
                              title="Impuesto"
                              value={ticket.tax.toFixed(2)}
                              suffix="MXN"
                              prefix={<Icon type="minus-circle" />}
                            />
                          </Col>
                          <Col span={6}>
                            <Statistic
                              valueStyle={{ color: '#3f8600' }}
                              title="Total"
                              value={ticket.totalPrice.toFixed(2)}
                              prefix={<Icon type="plus-square" />}
                              suffix="MXN"
                            />
                          </Col>
                        </Row>
                      </Panel>
                    ))}
                  </Collapse>
                </Panel>
              ))}
            </Collapse>
          </Card>
        </>
      )}
    </>
  );
};

Turns.propTypes = {
  client: PropTypes.object.isRequired,
  globalFilters: PropTypes.object.isRequired
};

export default withApollo(Turns);
