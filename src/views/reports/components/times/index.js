import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment-timezone';
import { format } from 'utils/functions';
import { useDebounce } from 'use-lodash-debounce';
import periods from 'utils/enums/periods';
import { withApollo } from 'react-apollo';
import {
  Typography,
  Select,
  Tag,
  Card,
  Col,
  Table,
  Statistic,
  Icon,
  Spin,
  Button,
  message
} from 'antd';
import { FiltersContainer, InputContainer } from './elements';
import Title from './components/title';
import {
  GET_TICKET_TIMES,
  GET_ROCKS,
  TURN_BY_UNIQUE_ID,
  GET_TURNS,
  GET_TIMES,
  GET_TIMES_XLS
} from './graphql/queries';
import { UPDATE_EXCLUSION } from './graphql/mutations';

const { Text } = Typography;
const { Option } = Select;

const getColorTime = time => {
  const mins = time / 1000 / 60;

  if (mins < 13) return 'blue';
  if (mins < 30) return 'green';
  if (mins < 45) return 'orange';

  return 'red';
};

const SalesReport = ({ client, globalFilters }) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [rocks, setRocks] = useState([]);
  const [loadingTurns, setLoadingTurns] = useState(false);
  const [loading, setLoading] = useState(true);
  const [turnUniqueId, setTurnUniqueId] = useState();
  const [rockIds, setRockIds] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [folioSearch, setFolioSearch] = useState('');
  const [loadingReport, setLoadingReport] = useState(false);
  const [turns, setTurns] = useState([]);
  const [turn, setTurn] = useState({});
  const debouncedFolioSearch = useDebounce(folioSearch, 500);
  const [times, setTimes] = useState({
    max: 0,
    min: 0,
    avg: 0
  });

  const updateData = () => {
    const getData = async () => {
      const [
        {
          data: { ticketTimes }
        },
        {
          data: { ticketTimesSummary }
        }
      ] = await Promise.all([
        client.query({
          query: GET_TIMES,
          variables: {
            date: {
              start: globalFilters.start,
              end: globalFilters.end
            },
            turnId: turn.id,
            rocks: rockIds
          }
        }),
        client.query({
          query: GET_TICKET_TIMES,
          variables: {
            date: {
              start: globalFilters.start,
              end: globalFilters.end
            },
            turnId: turn.id,
            rocks: rockIds,
            folioSearch: debouncedFolioSearch
          }
        })
      ]);
      setTickets(ticketTimesSummary);
      setTimes(ticketTimes);
      setLoading(false);
    };

    getData();
  };

  useEffect(updateData, [globalFilters, turn, rockIds, client, debouncedFolioSearch]);

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
      if (turnUniqueId) {
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

  const downloadReport = async () => {
    setLoadingReport(true);

    const {
      data: { ticketTimesXLS }
    } = await client.query({
      query: GET_TIMES_XLS,
      variables: {
        date: {
          start: globalFilters.start,
          end: globalFilters.end
        },
        turnId: turn.id,
        rocks: rockIds
      }
    });

    const link = document.createElement('a');
    link.href = encodeURI(ticketTimesXLS);
    link.download = `CLIENTES-${new Date().toISOString()}.xlsx`;
    link.target = '_blank';
    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);
    setLoadingReport(false);
  };

  const updateExcluded = async exclude => {
    const { errors } = await client.mutate({
      mutation: UPDATE_EXCLUSION,
      variables: {
        exclude,
        tickets: selectedRowKeys
      }
    });

    if (errors) {
      message.error(errors[0].message);
    } else {
      setLoading(true);
      await setSelectedRowKeys([]);
      await updateData();
      message.success('Se han actualizado correctamente los datos y boletas');
    }
  };

  const columns = [
    {
      title: 'Folio',
      dataIndex: 'folio',
      key: 'folio',
      width: 80
    },
    {
      title: 'Fecha',
      dataIndex: 'out',
      key: 'out',
      width: 130,
      render: out => (
        <>
          <Tag color="geekblue">{moment(out).format('DD/MM/YYYY')}</Tag>
          <Tag color="purple">{moment(out).format('HH:MM A')}</Tag>
        </>
      )
    },
    {
      title: 'Negocio',
      dataIndex: 'businessName',
      key: 'businessName',
      width: 150
    },
    {
      title: 'Placas',
      dataIndex: 'plates',
      key: 'plates',
      width: 100
    },
    {
      title: 'Producto',
      dataIndex: 'product',
      key: 'product',
      width: 100
    },
    {
      title: 'Tiempo',
      dataIndex: 'time',
      key: 'time',
      sorter: (a, b) => a.time - b.time,
      width: 100,
      render: time => (
        <>
          <Tag color={getColorTime(time)}>{format.time(time)}</Tag>
        </>
      )
    },
    {
      title: 'Excluir de métricas',
      dataIndex: 'excludeFromTimeMetrics',
      key: 'excludeFromTimeMetrics',
      width: 100,
      render: excludeFromTimeMetrics => (
        <>
          <Tag color={excludeFromTimeMetrics ? 'purple' : 'blue'}>
            {excludeFromTimeMetrics ? 'Si' : 'No'}
          </Tag>
        </>
      )
    }
  ];

  return (
    <>
      <FiltersContainer>
        <InputContainer>
          <Text type="secondary">Turno</Text>
          <Select
            allowClear
            className="turnFilter"
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
            style={{ minWidth: 200 }}
            className="productSelect"
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
        <Button
          style={{ marginLeft: 5, marginTop: 20 }}
          loading={loadingReport}
          type="primary"
          icon="file-excel"
          onClick={downloadReport}
        >
          {(loadingReport && 'Generando...') || 'Descargar reporte'}
        </Button>
      </FiltersContainer>
      {loading ? (
        <div style={{ display: 'flex', alingItems: 'center', justifyContent: 'center' }}>
          <Spin />
        </div>
      ) : (
        <>
          <Card>
            <Col span={24} xl={8}>
              <Statistic
                valueStyle={{ color: '#3f8600' }}
                title="Mínimo"
                value={format.time(times.min)}
                suffix="hh:mm:ss"
                prefix={<Icon type="clock-circle" />}
              />
            </Col>
            <Col span={24} xl={8}>
              <Statistic
                valueStyle={{ color: '#FF4F64' }}
                title="Máximo"
                value={format.time(times.max)}
                suffix="hh:mm:ss"
                prefix={<Icon type="clock-circle" />}
              />
            </Col>
            <Col span={24} xl={8}>
              <Statistic
                valueStyle={{ color: '#30CEE7' }}
                title="Promedio"
                value={format.time(times.avg)}
                suffix="hh:mm:ss"
                prefix={<Icon type="clock-circle" />}
              />
            </Col>
          </Card>
          <Card bordered={false} style={{ marginTop: 20 }}>
            <Table
              loading={loading}
              columns={columns}
              title={() => (
                <Title
                  style={{ margin: 'auto 10px' }}
                  folioSearch={folioSearch}
                  setFolioSearch={setFolioSearch}
                  results={tickets.length}
                  updateExcluded={updateExcluded}
                  areSelected={selectedRowKeys.length > 0}
                />
              )}
              size="small"
              rowSelection={{
                selectedRowKeys,
                onChange: setSelectedRowKeys
              }}
              pagination={{ defaultPageSize: 40 }}
              dataSource={tickets.map(ticket => ({
                ...ticket,
                businessName: ticket.client.businessName,
                plates: ticket.truck.plates,
                product: ticket.product.name,
                key: ticket.id
              }))}
            />
          </Card>
        </>
      )}
    </>
  );
};

SalesReport.propTypes = {
  client: PropTypes.object.isRequired,
  globalFilters: PropTypes.object.isRequired
};

export default withApollo(SalesReport);
