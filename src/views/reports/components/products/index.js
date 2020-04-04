import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { withApollo } from '@apollo/react-hoc';
import { useDebounce } from 'use-lodash-debounce';
import {
  PieChart,
  Pie,
  LineChart,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  Line,
  Tooltip
} from 'recharts';
import {
  message,
  Select,
  Typography,
  Spin,
  Tag,
  Table,
  Statistic,
  Icon,
  Card,
  Empty,
  Col
} from 'antd';
import shortid from 'shortid';
import { FiltersContainer, ChartsContainer, InputContainer } from './elements';
import { GET_ROCK_MONTH_SALES, GET_ROCK_SALES, GET_ROCKS } from './graphql/queries';

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
    key: 'totalWeight'
  },
  {
    title: 'Total',
    dataIndex: 'totalPrice',
    key: 'totalPrice'
  }
];

const ProductSales = ({ client, globalFilters }) => {
  const [filters, setFilters] = useState({
    rocks: [],
    type: null
  });
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [productSalesReport, setProductSalesReport] = useState([]);
  const [productMonthSalesReport, setProductMonthSalesReport] = useState([]);
  const [tickets, setTickets] = useState([]);
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
              type: debouncedFilters.type ? debouncedFilters.type === 'BILL' : null
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
  }, [globalFilters, debouncedFilters, client]);

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
      <Card>
        <Col span={12}>
          <Statistic
            valueStyle={{ color: '#3f8600' }}
            title="Ventas totales"
            value={productSalesReport.total ?? 0}
            suffix="MXN"
            prefix={<Icon type="rise" />}
          />
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
            <ResponsiveContainer width="50%" height={220}>
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
