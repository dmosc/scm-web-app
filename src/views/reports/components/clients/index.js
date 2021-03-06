import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { format } from 'utils/functions';
import { useDebounce } from 'use-lodash-debounce';
import moment from 'moment-timezone';
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
import { GET_CLIENTS, GET_SUMMARY, GET_SUMMARY_XLS, GET_TURNS } from './graphql/queries';
import { ChartsContainer, FiltersContainer, InputContainer, Col } from './elements';

const { Panel } = Collapse;
const { Option } = Select;
const { Text } = Typography;

const Turns = ({ client, globalFilters }) => {
  const [turnId, setTurnId] = useState();
  const [billType, setBillType] = useState('');
  const [clientIds, setClientIds] = useState([]);
  const [loadingClients, setLoadingClients] = useState();
  const [loadingTurns, setLoadingTurns] = useState();
  const [turns, setTurns] = useState([]);
  const [clients, setClients] = useState([]);
  const [clientSearch, setClientSearch] = useState('');
  const [clientsSummary, setClientsSummary] = useState();
  const [loading, setLoading] = useState(true);
  const [loadingReport, setLoadingReport] = useState(false);
  const [ticketCount, setTicketCount] = useState(0);
  const [remissionCount, setRemissionCount] = useState(0);
  const [billCount, setBillCount] = useState(0);
  const debouncedSearch = useDebounce(clientSearch, 1000);

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
        data: { clientsSummary: toSet }
      } = await client.query({
        query: GET_SUMMARY,
        variables: {
          turnId,
          clientIds: clientIds.map(clientId => clientId.split(':')[1]),
          range,
          billType: billType || undefined
        }
      });

      const ticketCountToSet = toSet.clients.reduce(
        (acc, { count, tickets }) => {
          // eslint-disable-next-line no-param-reassign
          acc.total += count;

          tickets.forEach(({ tax }) => (tax > 0 ? acc.bills++ : acc.remissions++));

          return acc;
        },
        { total: 0, remissions: 0, bills: 0 }
      );

      setClientsSummary(toSet);
      setTicketCount(ticketCountToSet.total);
      setRemissionCount(ticketCountToSet.remissions);
      setBillCount(ticketCountToSet.bills);
      setLoading(false);
    };

    getClientsSummary();
  }, [client, globalFilters, turnId, clientIds, billType]);

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
    const getClients = async () => {
      setLoadingClients(true);
      if (!debouncedSearch) {
        setClients([]);
        setLoadingClients(false);
        return;
      }

      setLoadingClients(true);

      const {
        data: { clients: clientsToSet }
      } = await client.query({
        query: GET_CLIENTS,
        variables: {
          filters: { limit: 10, search: debouncedSearch }
        }
      });

      setLoadingClients(false);
      setClients(clientsToSet);
    };

    getClients();
  }, [client, debouncedSearch]);

  const downloadReport = async () => {
    setLoadingReport(true);

    const range =
      globalFilters.end && globalFilters.start
        ? {
            start: globalFilters.start,
            end: globalFilters.end
          }
        : undefined;

    const {
      data: { clientsSummaryXLS }
    } = await client.query({
      query: GET_SUMMARY_XLS,
      variables: {
        turnId,
        clientIds: clientIds.map(clientId => clientId.split(':')[1]),
        range,
        billType: billType || undefined
      }
    });

    const link = document.createElement('a');
    link.href = encodeURI(clientsSummaryXLS);
    link.download = `CLIENTES-${new Date().toISOString()}.xlsx`;
    link.target = '_blank';
    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);
    setLoadingReport(false);
  };

  return (
    <>
      <FiltersContainer>
        <InputContainer style={{ width: '100%' }}>
          <Text type="secondary">Cliente seleccionado</Text>
          <Select
            showSearch
            allowClear
            style={{ width: '100%' }}
            placeholder="Cliente"
            onSearch={setClientSearch}
            loading={loadingClients}
            value={clientIds}
            onChange={setClientIds}
            mode="multiple"
            defaultValue={[]}
            notFoundContent={null}
          >
            {clients.map(({ id, businessName }) => (
              // This doesn't work if i set only id as value, IDK why :/
              <Option key={id} value={`${businessName}:${id}`}>
                <span>{`${businessName}`}</span>
              </Option>
            ))}
          </Select>
        </InputContainer>
      </FiltersContainer>
      <FiltersContainer>
        <InputContainer>
          <Text type="secondary">Turno</Text>
          <Select
            allowClear
            className="turnFilter"
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
            className="ticketFilter"
            placeholder="Tipo de boletas"
            onChange={value => setBillType(value)}
            notFoundContent={null}
            value={billType}
          >
            <Option value="">Todas</Option>
            <Option value="BILL">Facturados</Option>
            <Option value="REMISSION">Remision</Option>
          </Select>
        </InputContainer>
        {clients.length > 0 && (
          <Button
            style={{ marginLeft: 5, marginTop: 20 }}
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
      ) : clientIds.length === 0 ? (
        <Empty
          style={{ margin: '40px 0' }}
          description={<span>Selecciona almenos un cliente</span>}
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      ) : (
        <>
          <Text disabled>* Valores no incluyen IVA</Text>
          <Card>
            <Col span={24} xl={5}>
              <Statistic
                valueStyle={{ color: '#3f8600' }}
                title="Ventas"
                value={format.currency(clientsSummary?.total || 0)}
                suffix="MXN"
                prefix={<Icon type="rise" />}
              />
              <Text disabled>{`${(
                clientsSummary?.upfrontWeight + clientsSummary?.creditWeight || 0
              ).toFixed(2)} tons`}</Text>
            </Col>
            <Col span={24} xl={5}>
              <Statistic
                valueStyle={{ color: '#30CEE7' }}
                title="Contado"
                value={format.currency(clientsSummary?.upfront || 0)}
                suffix="MXN"
              />
              <Text disabled>{`${(clientsSummary?.upfrontWeight || 0).toFixed(2)} tons`}</Text>
            </Col>
            <Col span={24} xl={5}>
              <Statistic
                valueStyle={{ color: '#FFAB00' }}
                title="Cr??dito"
                value={format.currency(clientsSummary?.credit || 0)}
                suffix="MXN"
              />
              <Text disabled>{`${(clientsSummary?.creditWeight || 0).toFixed(2)} tons`}</Text>
            </Col>
            <Col span={24} xl={3}>
              <Statistic
                valueStyle={{ color: '#1890ff' }}
                title="Boletas"
                value={ticketCount}
                prefix={<Icon type="file-done" />}
              />
            </Col>
            <Col span={24} xl={3}>
              <Statistic
                valueStyle={{ color: '#1890ff' }}
                title="Facturadas"
                value={billCount}
                prefix={<Icon type="file-done" />}
              />
            </Col>
            <Col span={24} xl={3}>
              <Statistic
                valueStyle={{ color: '#1890ff' }}
                title="Remisionadas"
                value={remissionCount}
                prefix={<Icon type="file-done" />}
              />
            </Col>
          </Card>
          <ChartsContainer>
            <Card title="Distribuci??n porcentual de cr??dito vs contado">
              <ResponsiveContainer height={220}>
                <PieChart height={220}>
                  <Pie
                    dataKey="value"
                    isAnimationActive={true}
                    data={[
                      {
                        name: 'credit',
                        value: Number(
                          ((clientsSummary.credit / clientsSummary.total) * 100).toFixed(2)
                        )
                      },
                      {
                        name: 'cash',
                        value: Number(
                          ((clientsSummary.upfront / clientsSummary.total) * 100).toFixed(2)
                        )
                      }
                    ]}
                    outerRadius={60}
                    label={true}
                  >
                    <Cell name="Cr??dito" key="credit" fill="#30CEE7" />
                    <Cell name="Contado" key="cash" fill="#FFAB00" />
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Card>
            <Card title="Distribuci??n porcentual de factura vs remision">
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
            <Card title="Gasto por cliente">
              <ResponsiveContainer height={220}>
                <BarChart
                  height={220}
                  data={clientsSummary?.clients?.map(({ info, tickets }) => {
                    let credit = 0;
                    let cash = 0;
                    let remissions = 0;
                    let bills = 0;

                    tickets.forEach(({ totalPrice, credit: isCredit, tax }) => {
                      if (isCredit) credit += totalPrice;
                      else cash += totalPrice;
                      if (tax > 0) remissions += totalPrice;
                      else bills += totalPrice;
                    });

                    return {
                      name: info.businessName,
                      credit: credit.toFixed(2),
                      cash: cash.toFixed(2),
                      remissions: remissions.toFixed(2),
                      bills: bills.toFixed(2)
                    };
                  })}
                  outerRadius={60}
                >
                  <XAxis tick={false} dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar name="Cr??dito" stackId="a" fill="#1890ff" dataKey="credit" />
                  <Bar name="Contado" stackId="a" fill="#3f8600" dataKey="cash" />
                  <Bar name="Remisiones" stackId="b" fill="#8884d8" dataKey="remissions" />
                  <Bar name="Facturas" stackId="b" fill="#82ca9d" dataKey="bills" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </ChartsContainer>
          <Card
            title={`${clientsSummary?.clients?.length ||
              0} tienen boletas con los filtros seleccionados`}
          >
            {clientsSummary?.clients?.length > 0 ? (
              <Collapse
                bordered={false}
                expandIcon={({ isActive }) => (
                  <Icon type="caret-right" rotate={isActive ? 90 : 0} />
                )}
              >
                {clientsSummary.clients?.map(({ info, count, tickets }) => (
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
                            <Col span={24} xl={6}>
                              <Statistic
                                valueStyle={{ color: '#FF4F64' }}
                                title="Peso neto"
                                value={format.number(ticket.totalWeight)}
                                suffix="tons"
                                prefix={<Icon type="car" />}
                              />
                            </Col>
                            <Col span={24} xl={6}>
                              <Statistic
                                valueStyle={{ color: '#1890ff' }}
                                title="Subtotal"
                                value={format.number(ticket.totalPrice - ticket.tax)}
                                suffix="MXN"
                                prefix={<Icon type="check-circle" />}
                              />
                            </Col>
                            <Col span={24} xl={6}>
                              <Statistic
                                valueStyle={{ color: '#FFAB00' }}
                                title="Impuesto"
                                value={format.number(ticket.tax)}
                                suffix="MXN"
                                prefix={<Icon type="minus-circle" />}
                              />
                            </Col>
                            <Col span={24} xl={6}>
                              <Statistic
                                valueStyle={{ color: '#3f8600' }}
                                title="Total"
                                value={format.number(ticket.totalPrice)}
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

Turns.propTypes = {
  client: PropTypes.object.isRequired,
  globalFilters: PropTypes.object.isRequired
};

export default withApollo(Turns);
