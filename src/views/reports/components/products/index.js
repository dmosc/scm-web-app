import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { format } from 'utils/functions';
import { withApollo } from '@apollo/react-hoc';
import { useDebounce } from 'use-lodash-debounce';
import periods from 'utils/enums/periods';
import moment from 'moment-timezone';
import {
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import {
  Card,
  Col,
  Empty,
  Icon,
  message,
  Select,
  Spin,
  Statistic,
  Table,
  Tag,
  Typography
} from 'antd';
import shortid from 'shortid';
import { ChartsContainer, FiltersContainer, InputContainer } from './elements';
import { GET_ROCK_MONTH_SALES, GET_ROCK_SALES, GET_ROCKS, GET_TURNS } from './graphql/queries';

const { Option } = Select;
const { Text } = Typography;

const columns = [
  {
    title: 'Folio',
    dataIndex: 'folio',
    key: 'folio',
    render: folio => <Text strong>{folio}</Text>
  },
  {
    title: 'Tipo',
    dataIndex: 'bill',
    key: 'bill',
    render: bill => <Tag>{bill ? 'FACTURA' : 'REMISIÓN'}</Tag>
  },
  {
    title: 'Pago',
    dataIndex: 'credit',
    key: 'credit',
    render: bill => <Tag>{bill ? 'CRÉDITO' : 'CONTADO'}</Tag>
  },
  {
    title: 'Producto',
    dataIndex: 'name',
    key: 'name'
  },
  {
    title: 'Peso neto',
    dataIndex: 'totalWeight',
    key: 'totalWeight',
    render: product => format.number(product)
  },
  {
    title: 'Total',
    dataIndex: 'totalPrice',
    key: 'totalPrice',
    render: totalPrice => format.number(totalPrice)
  }
];

const ProductSales = ({ client, globalFilters }) => {
  const [filters, setFilters] = useState({
    rocks: [],
    type: undefined,
    paymentType: undefined
  });
  const [loading, setLoading] = useState(true);
  const [loadingTurns, setLoadingTurns] = useState(true);
  const [products, setProducts] = useState([]);
  const [turns, setTurns] = useState([]);
  const [productSalesReport, setProductSalesReport] = useState([]);
  const [productMonthSalesReport, setProductMonthSalesReport] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [turnId, setTurnId] = useState();
  const debouncedFilters = useDebounce(filters, 1000);

  const handleFilterChange = (key, value) => {
    const filtersToSet = { ...filters, [key]: value };

    // eslint-disable-next-line no-param-reassign
    if (key === 'type' && value === '') value = null;

    setFilters(filtersToSet);
  };

  useEffect(() => {
    const getData = async () => {
      try {
        setLoading(true);
        const {
          data: { rocks }
        } = await client.query({
          query: GET_ROCKS,
          variables: { filters: {} }
        });

        setProducts(rocks);
        setLoading(false);
      } catch (e) {
        message.error('¡No se han podido cargar los productos correctamente!');

        setLoading(false);
      }
    };

    getData();
  }, [client]);

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
    const getData = async () => {
      try {
        setLoading(true);
        const {
          data: { rockSalesReport }
        } = await client.query({
          query: GET_ROCK_SALES,
          variables: {
            filters: {
              ...globalFilters,
              ...debouncedFilters,
              type: debouncedFilters.type ? debouncedFilters.type === 'BILL' : null,
              turn: turnId || undefined
            }
          }
        });

        const newTickets = [];
        rockSalesReport.rocks.map(({ rock, tickets: rockTickets }) =>
          rockTickets.map(ticket =>
            newTickets.push({
              ...ticket,
              name: rock.name
            })
          )
        );

        setProductSalesReport(rockSalesReport);
        setTickets(newTickets);
        setLoading(false);
      } catch (e) {
        message.error('¡No se han podido cargar las ventas por producto!');

        setLoading(false);
      }
    };

    getData();
  }, [globalFilters, debouncedFilters, client, turnId]);

  useEffect(() => {
    const getData = async () => {
      try {
        setLoading(true);
        const {
          data: {
            rockMonthSalesReport: { monthSummary }
          }
        } = await client.query({
          query: GET_ROCK_MONTH_SALES,
          variables: {
            filters: {
              ...globalFilters,
              ...debouncedFilters,
              type: debouncedFilters.type ? debouncedFilters.type === 'BILL' : null
            }
          }
        });

        const newProductMonthSalesReport = [];
        monthSummary.forEach(summary => {
          const month = {};
          month.name = summary.month.substring(0, 3);

          summary.rocks.forEach(({ name, total }) => {
            month[name] = parseFloat(total.toFixed(2));
          });

          newProductMonthSalesReport.push(month);
        });

        setProductMonthSalesReport(newProductMonthSalesReport);
        setLoading(false);
      } catch (e) {
        message.error('¡No se han podido cargar las ventas por producto!');

        setLoading(false);
      }
    };

    getData();
  }, [globalFilters, debouncedFilters, client]);

  return (
    <>
      <FiltersContainer>
        <InputContainer>
          <Text type="secondary">Turno</Text>
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
            onChange={value => handleFilterChange('type', value)}
            style={{ width: 120 }}
            value={filters.type || ''}
          >
            <Option value="">Todos</Option>
            <Option value="BILL">Factura</Option>
            <Option value="REMISSION">Remisión</Option>
          </Select>
        </InputContainer>
        <InputContainer>
          <Text type="secondary">Tipo de pago</Text>
          <Select
            onChange={value => handleFilterChange('paymentType', value)}
            style={{ width: 120 }}
            value={filters.paymentType || ''}
          >
            <Option value="">Todos</Option>
            <Option value="CASH">Contado</Option>
            <Option value="CREDIT">Crédito</Option>
          </Select>
        </InputContainer>
        <InputContainer>
          <Text type="secondary">Filtrar por producto</Text>
          <Select
            loading={loading}
            mode="multiple"
            allowClear
            onChange={rocks => handleFilterChange('rocks', rocks)}
            placeholder="Producto"
            defaultValue={[]}
          >
            {products.map(({ id, name }) => (
              <Option key={id} value={id}>
                {name}
              </Option>
            ))}
          </Select>
        </InputContainer>
      </FiltersContainer>
      <Text disabled>* Valores no incluyen IVA</Text>
      <Card>
        <Col span={12}>
          <Statistic
            valueStyle={{ color: '#3f8600' }}
            title="Ventas"
            value={format.currency(productSalesReport?.total || 0)}
            suffix="MXN"
            prefix={<Icon type="rise" />}
          />
          <Text disabled>{`${(productSalesReport?.totalWeight || 0).toFixed(2)} tons`}</Text>
        </Col>
        <Col span={12}>
          <Statistic
            valueStyle={{ color: '#1890ff' }}
            title="Boletas"
            value={tickets.length}
            prefix={<Icon type="file-done" />}
          />
        </Col>
      </Card>
      <ChartsContainer>
        <Card title="Gráfico de pie">
          {loading && (
            <div style={{ display: 'flex', alingItems: 'center', justifyContent: 'center' }}>
              <Spin />
            </div>
          )}
          {productSalesReport?.rocks?.length > 0 && !loading && (
            <ResponsiveContainer height={220}>
              <PieChart width={220} height={220}>
                <Pie
                  dataKey="value"
                  isAnimationActive={true}
                  data={productSalesReport?.rocks?.map(
                    ({ rock: { name, color }, total: value }) => ({
                      name,
                      color,
                      value
                    })
                  )}
                  outerRadius={60}
                  fill="#8884d8"
                  label={true}
                >
                  {productSalesReport?.rocks?.map(({ rock: { name, color } }) => (
                    <Cell key={name} fill={color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
          {productSalesReport?.rocks?.length === 0 && (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
          )}
        </Card>
        {!turnId && (
          <Card title="Distribución">
            {loading && (
              <div style={{ display: 'flex', alingItems: 'center', justifyContent: 'center' }}>
                <Spin />
              </div>
            )}
            {productSalesReport?.rocks?.length > 0 && !loading && (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={productMonthSalesReport}>
                  <XAxis dataKey="name" />
                  <YAxis padding={{ left: 0, right: 0 }} />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip />
                  <Legend />
                  {productSalesReport?.rocks?.map(({ rock: { name, color } }) => (
                    <Line
                      type="monotone"
                      animationEasing="linear"
                      strokeWidth={3}
                      key={name}
                      dataKey={name}
                      stroke={color}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            )}
            {productSalesReport?.rocks?.length === 0 && (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
          </Card>
        )}
      </ChartsContainer>
      <Card title={`${tickets.length} Boletas`}>
        <Table
          loading={loading}
          columns={columns}
          size="small"
          scroll={{ x: true, y: '55vh' }}
          pagination={{ defaultPageSize: 20 }}
          dataSource={tickets.map(ticket => ({ ...ticket, key: shortid.generate() }))}
        />
      </Card>
    </>
  );
};

ProductSales.propTypes = {
  client: PropTypes.object.isRequired,
  globalFilters: PropTypes.object.isRequired
};

export default withApollo(ProductSales);
