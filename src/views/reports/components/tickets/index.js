import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { format } from 'utils/functions';
import { withApollo } from '@apollo/react-hoc';
import periods from 'utils/enums/periods';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import moment from 'moment';
import {
  Button,
  Card,
  Col,
  Collapse,
  Empty,
  Icon,
  Row,
  Select,
  Spin,
  Statistic,
  Tag,
  Typography
} from 'antd';
import { ChartsContainer, FiltersContainer, InputContainer } from './elements';
import {
  GET_SUMMARY,
  GET_SUMMARY_BY_CLIENT_XLS,
  GET_SUMMARY_BY_DATE_XLS,
  GET_TURNS
} from './graphql/queries';

const { Text } = Typography;
const { Option } = Select;
const { Panel } = Collapse;

const Tickets = ({ client, globalFilters }) => {
  const [loading, setLoading] = useState(true);
  const [loadingReportByClients, setLoadingReportByClients] = useState(false);
  const [loadingReportByDates, setLoadingReportByDates] = useState(false);
  const [loadingTurns, setLoadingTurns] = useState(false);
  const [turns, setTurns] = useState([]);
  const [turnId, setTurnId] = useState();
  const [billType, setBillType] = useState('');
  const [ticketsSummary, setTicketsSummary] = useState();
  const [ticketCount, setTicketCount] = useState(0);
  const [remissionCount, setRemissionCount] = useState(0);
  const [billCount, setBillCount] = useState(0);
  const [creditCount, setCreditCount] = useState(0);
  const [cashCount, setCashCount] = useState(0);
  const [paymentType, setPaymentType] = useState('');

  useEffect(() => {
    const getClientsSummary = async () => {
      setLoading(true);
      const range =
        globalFilters.end && globalFilters.start
          ? {
              start: globalFilters.start,
              end: globalFilters.end
            }
          : undefined;

      const {
        data: { ticketsSummary: toSet }
      } = await client.query({
        query: GET_SUMMARY,
        variables: {
          turnId,
          range,
          billType: billType || undefined,
          paymentType: paymentType || undefined
        }
      });

      const ticketCountToSet = toSet.clients.reduce(
        (acc, { count, tickets }) => {
          // eslint-disable-next-line no-param-reassign
          acc.total += count;

          tickets.forEach(({ tax, credit }) => {
            tax > 0 ? acc.bills++ : acc.remissions++;
            credit ? acc.credit++ : acc.cash++;
          });

          return acc;
        },
        { total: 0, remissions: 0, bills: 0, cash: 0, credit: 0 }
      );

      setTicketsSummary(toSet);
      setTicketCount(ticketCountToSet.total);
      setRemissionCount(ticketCountToSet.remissions);
      setBillCount(ticketCountToSet.bills);
      setCreditCount(ticketCountToSet.credit);
      setCashCount(ticketCountToSet.cash);

      setLoading(false);
    };

    getClientsSummary();
  }, [client, globalFilters, turnId, billType, paymentType]);

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

  const downloadReportByDates = async () => {
    setLoadingReportByDates(true);

    const range =
      globalFilters.end && globalFilters.start
        ? {
            start: globalFilters.start,
            end: globalFilters.end
          }
        : undefined;

    const {
      data: { ticketsSummaryByDateXLS }
    } = await client.query({
      query: GET_SUMMARY_BY_DATE_XLS,
      variables: {
        turnId,
        range,
        billType: billType || undefined,
        paymentType: paymentType || undefined
      }
    });

    const link = document.createElement('a');
    link.href = encodeURI(ticketsSummaryByDateXLS);
    link.download = `BOLETAS-FECHA-${new Date().toISOString()}.xlsx`;
    link.target = '_blank';
    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);
    setLoadingReportByDates(false);
  };

  const downloadReportByClients = async () => {
    setLoadingReportByClients(true);

    const range =
      globalFilters.end && globalFilters.start
        ? {
            start: globalFilters.start,
            end: globalFilters.end
          }
        : undefined;

    const {
      data: { ticketsSummaryByClientXLS }
    } = await client.query({
      query: GET_SUMMARY_BY_CLIENT_XLS,
      variables: {
        turnId,
        range,
        billType: billType || undefined,
        paymentType: paymentType || undefined
      }
    });

    const link = document.createElement('a');
    link.href = encodeURI(ticketsSummaryByClientXLS);
    link.download = `BOLETAS-CLIENTE-${new Date().toISOString()}.xlsx`;
    link.target = '_blank';
    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);
    setLoadingReportByClients(false);
  };

  return (
    <>
      <FiltersContainer>
        <InputContainer>
          <Text type="secondary">Turno seleccionado</Text>
          <Select
            allowClear
            style={{ minWidth: 600 }}
            placeholder="Turno"
            onChange={value => setTurnId(value)}
            notFoundContent={null}
            loading={loadingTurns}
            value={turnId}
          >
            {turns.map(
              ({ id, uniqueId, end, user, period }) =>
                end && (
                  <Option key={id} value={id}>
                    <Tag color="blue">{periods[period]}</Tag>
                    {user.firstName} {user.lastName} ({uniqueId}) (Terminado el{' '}
                    {moment(end)
                      .locale('es')
                      .format('lll')}
                    )
                  </Option>
                )
            )}
          </Select>
        </InputContainer>
        <InputContainer>
          <Text type="secondary">Tipo de boletas</Text>
          <Select
            allowClear
            style={{ minWidth: 150 }}
            placeholder="Tipo de boletas"
            onChange={value => setBillType(value)}
            value={billType}
          >
            <Option value="">Todas</Option>
            <Option value="BILL">Facturados</Option>
            <Option value="REMISSION">Remision</Option>
          </Select>
        </InputContainer>
        <InputContainer>
          <Text type="secondary">Tipo de pago</Text>
          <Select
            allowClear
            style={{ minWidth: 150 }}
            placeholder="Tipo de pago"
            onChange={value => setPaymentType(value)}
            value={paymentType}
          >
            <Option value="">Todas</Option>
            <Option value="CASH">Contado</Option>
            <Option value="CREDIT">Crédito</Option>
          </Select>
        </InputContainer>
        <Button
          style={{ marginLeft: 'auto', marginTop: 20 }}
          loading={loadingReportByClients}
          type="primary"
          icon="file-excel"
          onClick={downloadReportByClients}
        >
          {(loadingReportByClients && 'Generando...') || 'Reporte por cliente'}
        </Button>
        <Button
          style={{ marginLeft: 5, marginTop: 20 }}
          loading={loadingReportByDates}
          type="primary"
          icon="file-excel"
          onClick={downloadReportByDates}
        >
          {(loadingReportByDates && 'Generando...') || 'Reporte por fecha'}
        </Button>
      </FiltersContainer>
      {loading ? (
        <div style={{ display: 'flex', alingItems: 'center', justifyContent: 'center' }}>
          <Spin />
        </div>
      ) : (
        <>
          <Card>
            <Row>
              <Col span={8}>
                <Statistic
                  valueStyle={{ color: '#3f8600' }}
                  title="Ventas"
                  value={format.currency(ticketsSummary?.total || 0)}
                  suffix="MXN"
                  prefix={<Icon type="rise" />}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  valueStyle={{ color: '#30CEE7' }}
                  title="Contado"
                  value={format.currency(ticketsSummary?.upfront || 0)}
                  suffix="MXN"
                />
              </Col>
              <Col span={8}>
                <Statistic
                  valueStyle={{ color: '#FFAB00' }}
                  title="Crédito"
                  value={format.currency(ticketsSummary?.credit || 0)}
                  suffix="MXN"
                />
              </Col>
            </Row>
            <Row style={{ marginTop: 20 }}>
              <Col span={4}>
                <Statistic
                  valueStyle={{ color: '#1890ff' }}
                  title="Boletas"
                  value={ticketCount}
                  prefix={<Icon type="file-done" />}
                />
              </Col>
              <Col span={5}>
                <Statistic
                  valueStyle={{ color: '#30CEE7' }}
                  title="Facturadas"
                  value={billCount}
                  prefix={<Icon type="file-done" />}
                />
              </Col>
              <Col span={5}>
                <Statistic
                  valueStyle={{ color: '#30CEE7' }}
                  title="Remisionadas"
                  value={remissionCount}
                  prefix={<Icon type="file-done" />}
                />
              </Col>
              <Col span={5}>
                <Statistic
                  valueStyle={{ color: '#FFAB00' }}
                  title="A crédito"
                  value={creditCount}
                  prefix={<Icon type="file-done" />}
                />
              </Col>
              <Col span={5}>
                <Statistic
                  valueStyle={{ color: '#FFAB00' }}
                  title="De contado"
                  value={cashCount}
                  prefix={<Icon type="file-done" />}
                />
              </Col>
            </Row>
          </Card>
          <ChartsContainer>
            <Card title="Distribución porcentual de crédito vs contado">
              <ResponsiveContainer height={220}>
                <PieChart height={220}>
                  <Pie
                    dataKey="value"
                    isAnimationActive={true}
                    data={[
                      {
                        name: 'credit',
                        value: Number(
                          ((ticketsSummary.credit / ticketsSummary.total) * 100).toFixed(2)
                        )
                      },
                      {
                        name: 'cash',
                        value: Number(
                          ((ticketsSummary.upfront / ticketsSummary.total) * 100).toFixed(2)
                        )
                      }
                    ]}
                    outerRadius={60}
                    label={true}
                  >
                    <Cell name="Crédito" key="credit" fill="#30CEE7" />
                    <Cell name="Contado" key="cash" fill="#FFAB00" />
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Card>
            <Card title="Distribución porcentual de factura vs remision">
              <ResponsiveContainer height={220}>
                <PieChart height={220}>
                  <Pie
                    dataKey="value"
                    isAnimationActive={true}
                    data={[
                      {
                        name: 'remission',
                        value: Number(((remissionCount / ticketCount) * 100).toFixed(2))
                      },
                      {
                        name: 'bill',
                        value: Number(((billCount / ticketCount) * 100).toFixed(2))
                      }
                    ]}
                    outerRadius={60}
                    label={true}
                  >
                    <Cell name="Remisiones" key="remission" fill="#FFAB00" />
                    <Cell name="Facturas" key="bill" fill="#30CEE7" />
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </ChartsContainer>
          <Card
            title={`${ticketsSummary?.clients?.length || 0} boletas con los filtros seleccionados`}
          >
            {ticketsSummary?.clients?.length > 0 ? (
              <Collapse
                bordered={false}
                expandIcon={({ isActive }) => (
                  <Icon type="caret-right" rotate={isActive ? 90 : 0} />
                )}
              >
                {ticketsSummary.clients?.map(({ info, count, tickets }) => (
                  <Panel key={info.id} header={info.businessName} extra={count}>
                    <Collapse
                      expandIcon={({ isActive }) => (
                        <Icon type="caret-right" rotate={isActive ? 90 : 0} />
                      )}
                    >
                      {tickets.map(ticket => (
                        <Panel
                          key={ticket.id}
                          header={ticket.folio}
                          extra={`$${ticket.totalPrice}`}
                        >
                          <Row
                            style={{ margin: 5, padding: 10 }}
                            gutter={{ xs: 8, sm: 16, md: 24 }}
                          >
                            <Col span={6}>
                              <Statistic
                                valueStyle={{ color: '#FF4F64' }}
                                title="Peso neto"
                                value={format.number(ticket.totalWeight)}
                                suffix="tons"
                                prefix={<Icon type="car" />}
                              />
                            </Col>
                            <Col span={6}>
                              <Statistic
                                valueStyle={{ color: '#1890ff' }}
                                title="Subtotal"
                                value={format.currency(ticket.totalPrice - ticket.tax)}
                                suffix="MXN"
                                prefix={<Icon type="check-circle" />}
                              />
                            </Col>
                            <Col span={6}>
                              <Statistic
                                valueStyle={{ color: '#FFAB00' }}
                                title="Impuesto"
                                value={format.currency(ticket.tax)}
                                suffix="MXN"
                                prefix={<Icon type="minus-circle" />}
                              />
                            </Col>
                            <Col span={6}>
                              <Statistic
                                valueStyle={{ color: '#3f8600' }}
                                title="Total"
                                value={format.currency(ticket.totalPrice)}
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
            ) : (
              <div style={{ display: 'flex', alingItems: 'center', justifyContent: 'center' }}>
                <Empty style={{ margin: '40px 0' }} image={Empty.PRESENTED_IMAGE_SIMPLE} />
              </div>
            )}
          </Card>
        </>
      )}
    </>
  );
};

Tickets.propTypes = {
  client: PropTypes.object.isRequired,
  globalFilters: PropTypes.object.isRequired
};

export default withApollo(Tickets);
