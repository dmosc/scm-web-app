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
import { notification, Select, Typography, Icon, Tag, Table } from 'antd';
import shortid from 'shortid';
import Container from 'components/common/container';
import { ProductSalesContainer, FiltersContainer, MessageContainer, Column } from './elements';
import { GET_ROCK_MONTH_SALES, GET_ROCK_SALES, GET_ROCKS } from './graphql/queries';

const { Option } = Select;
const { Title, Text } = Typography;

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

const ProductSales = ({ client, filters: globalFilters }) => {
  const [filters, setFilters] = useState({
    rocks: []
  });
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [productSalesReport, setProductSalesReport] = useState([]);
  const [productMonthSalesReport, setProductMonthSalesReport] = useState([]);
  const [tickets, setTickets] = useState([]);
  const debouncedFilters = useDebounce(filters, 1000);

  const handleFilterChange = (key, value) => {
    const filtersToSet = { ...filters, [key]: value };

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
        notification.open({
          message: '¡No se han podido cargar los productos correctamente!'
        });

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
              type: globalFilters.type ? globalFilters.type === 'BILL' : null
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
        notification.open({
          message: '¡No se han podido cargar las ventas por producto!'
        });

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
              type: globalFilters.type ? globalFilters.type === 'BILL' : null
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
        notification.open({
          message: '¡No se han podido cargar las ventas por producto!'
        });

        setLoading(false);
      }
    };

    getData();
  }, [globalFilters, debouncedFilters, client]);

  return (
    <ProductSalesContainer>
      <Column>
        <Container
          title={`Ventas totales: $${productSalesReport.total ?? 0}`}
          margin="10px 30px"
          justifycontent="center"
          alignitems="center"
          width="90%"
          height="fit-content"
        >
          <FiltersContainer>
            <Select
              loading={loading}
              mode="multiple"
              allowClear
              onChange={rocks => handleFilterChange('rocks', rocks)}
              style={{ width: '100%' }}
              placeholder="Filtra por producto"
              defaultValue={[]}
            >
              {products.map(({ id, name }) => (
                <Option key={id} value={id}>
                  {name}
                </Option>
              ))}
            </Select>
          </FiltersContainer>
          {loading && <Icon type="loading"/>}
          {productSalesReport?.rocks?.length > 0 && !loading && (
            <div style={{ padding: 20 }}>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={productMonthSalesReport}>
                  <XAxis dataKey="name"/>
                  <YAxis padding={{ left: 0, right: 0 }}/>
                  <CartesianGrid strokeDasharray="3 3"/>
                  <Tooltip/>
                  <Legend/>
                  {productSalesReport?.rocks?.map(({ rock: { name, color } }) => (
<<<<<<< HEAD
                    <Line type="monotone" animationEasing="linear" strokeWidth={3} key={name} dataKey={name}
                          stroke={color}/>
=======
                    <Line
                      type="monotone"
                      animationEasing="linear"
                      strokeWidth={3}
                      key={name}
                      dataKey={name}
                      stroke={color}
                    />
>>>>>>> hotfix ( index.js ) General fixing of issues and typos in app
                  ))}
                </LineChart>
              </ResponsiveContainer>
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
                      <Cell key={name} fill={color}/>
                    ))}
                  </Pie>
                  <Tooltip/>
                  <Legend/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
          {productSalesReport?.rocks?.length === 0 && (
            <MessageContainer>
              <Title level={4}>No hay suficientes datos...</Title>
            </MessageContainer>
          )}
        </Container>
      </Column>
      <Column>
        <Container
          title={`${tickets.length} Boletas`}
          margin="10px 30px"
          justifycontent="center"
          alignitems="center"
          width="90%"
          height="fit-content"
        >
          <Table
            loading={loading}
            columns={columns}
            size="small"
            scroll={{ x: true, y: '55vh' }}
            pagination={{ defaultPageSize: 20 }}
            dataSource={tickets.map(ticket => ({ ...ticket, key: shortid.generate() }))}
          />
        </Container>
      </Column>
    </ProductSalesContainer>
  );
};

ProductSales.propTypes = {
  client: PropTypes.object.isRequired,
  filters: PropTypes.object.isRequired
};

export default withApollo(ProductSales);
