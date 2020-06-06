import React, { useEffect, useState } from 'react';
import { withApollo } from '@apollo/react-hoc';
import { useDebounce } from 'use-lodash-debounce';
import moment from 'moment-timezone';
import PropTypes from 'prop-types';
import shortid from 'shortid';
import { format, printPDF } from 'utils/functions';
import { Button, notification, Row, Table, Tag, Tooltip, Typography } from 'antd';
import Title from './components/title';
import { Card, HistoryContainer, TableContainer } from './elements';
import { GET_HISTORY_TICKETS, GET_PDF } from './graphql/queries';

const { Text } = Typography;

const History = ({ client }) => {
  const [filters, setFilters] = useState({
    range: {
      start: null,
      end: null
    },
    turnId: '',
    billType: null,
    paymentType: null,
    clientIds: [],
    truckId: '',
    productId: '',
    folio: ''
  });
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState([]);
  const [results, setResults] = useState(0);
  const debouncedFolio = useDebounce(filters.folio, 500);

  const handleFilterChange = (key, value) => {
    // eslint-disable-next-line no-param-reassign
    if (key === 'type' && value === '') value = null;
    const filtersToSet = { ...filters, [key]: value };

    setFilters(filtersToSet);
  };

  const handleDateFilterChange = dates => {
    const start = dates[0];
    const end = dates[1];

    setFilters({
      ...filters,
      range: {
        start,
        end
      }
    });
  };

  const downloadPDF = async id => {
    const {
      data: { ticketPDF }
    } = await client.query({
      query: GET_PDF,
      variables: {
        idOrFolio: id
      }
    });

    await printPDF(ticketPDF);
  };

  useEffect(() => {
    const getData = async () => {
      try {
        setLoading(true);
        const {
          data: { archivedTickets }
        } = await client.query({
          query: GET_HISTORY_TICKETS,
          variables: {
            range: filters.range,
            turnId: filters.turnId,
            billType: filters.billType,
            paymentType: filters.paymentType,
            clientIds: filters.clientIds.map(composedId => composedId.split(':')[1]),
            truckId: filters.truckId,
            productId: filters.productId,
            folio: debouncedFolio,
            client: filters.client
          }
        });

        const archivedTicketsToSet = archivedTickets.map(ticket => ({
          ...ticket,
          subtotal: ticket.totalPrice - ticket.tax,
          businessName: ticket.client.businessName,
          rfc: ticket.client.rfc,
          plates: ticket.truck.plates,
          truckWeight: ticket.truck.weight,
          product: ticket.product.name,
          price: format.currency(ticket.totalPrice / ticket.weight),
          client: `${ticket.client.firstName} ${ticket.client.lastName}`
        }));

        setTickets(archivedTicketsToSet);
        setResults(archivedTicketsToSet.length);
        setLoading(false);
      } catch (e) {
        notification.open({
          message: '¡No se han podido cargar las boletas correctamente!'
        });
      }
    };

    getData();
  }, [
    filters.range,
    filters.turnId,
    filters.billType,
    filters.paymentType,
    filters.clientIds,
    filters.truckId,
    filters.productId,
    debouncedFolio,
    filters.client,
    client
  ]);

  const columns = [
    {
      title: 'Folio',
      dataIndex: 'folio',
      key: 'folio',
      width: 80,
      fixed: 'left'
    },
    {
      title: 'Fecha',
      dataIndex: 'out',
      key: 'out',
      width: 130,
      fixed: 'left',
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
      width: 150,
      fixed: 'left'
    },
    {
      title: 'Cliente',
      dataIndex: 'client',
      key: 'client',
      width: 150,
      fixed: 'left'
    },
    {
      title: 'RFC',
      dataIndex: 'rfc',
      key: 'rfc',
      width: 100
    },
    {
      title: 'Conductor',
      dataIndex: 'driver',
      key: 'driver',
      width: 100
    },
    {
      title: 'Placas',
      dataIndex: 'plates',
      key: 'plates',
      width: 100
    },
    {
      title: 'Foto de entrada',
      dataIndex: 'inTruckImage',
      key: 'inTruckImage',
      width: 100,
      render: inTruckImage => (
        <Button type="link" href={inTruckImage} target="_blank" rel="noopener noreferrer">
          Ver foto
        </Button>
      )
    },
    {
      title: 'Foto de salida',
      dataIndex: 'outTruckImage',
      key: 'outTruckImage',
      width: 100,
      render: outTruckImage => (
        <Button type="link" href={outTruckImage} target="_blank" rel="noopener noreferrer">
          Ver foto
        </Button>
      )
    },
    {
      title: 'Producto',
      dataIndex: 'product',
      key: 'product',
      width: 100
    },
    {
      title: 'Precio por unidad',
      dataIndex: 'price',
      key: 'price',
      width: 100
    },
    {
      title: 'Peso del camión',
      dataIndex: 'truckWeight',
      key: 'truckWeight',
      width: 100
    },
    {
      title: 'Peso bruto',
      dataIndex: 'weight',
      key: 'weight',
      width: 100
    },
    {
      title: 'Peso neto',
      dataIndex: 'totalWeight',
      key: 'totalWeight',
      width: 100
    },
    {
      title: 'Subtotal',
      dataIndex: 'subtotal',
      key: 'subtotal',
      width: 120,
      fixed: 'right',
      render: subtotal => <Tag>{format.currency(subtotal)}</Tag>
    },
    {
      title: 'Impuesto',
      dataIndex: 'tax',
      key: 'tax',
      width: 120,
      fixed: 'right',
      render: tax => <Tag>{format.currency(tax)}</Tag>
    },
    {
      title: 'Total',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      width: 120,
      fixed: 'right',
      render: total => <Tag>{format.currency(total)}</Tag>
    },
    {
      title: 'Acciones',
      key: 'actions',
      align: 'right',
      fixed: 'right',
      render: row => (
        <Row>
          <Tooltip placement="top" title="Imprimir">
            <Button
              onClick={() => downloadPDF(row.id)}
              type="primary"
              icon="printer"
              size="small"
            />
          </Tooltip>
        </Row>
      )
    }
  ];

  return (
    <HistoryContainer>
      <TableContainer>
        <Card bordered={false}>
          <Table
            loading={loading}
            columns={columns}
            title={() => (
              <Title
                style={{ margin: 'auto 10px' }}
                level={3}
                filters={filters}
                results={results}
                handleFilterChange={handleFilterChange}
                handleDateFilterChange={handleDateFilterChange}
              />
            )}
            footer={ticketsToAdd => {
              let subtotal = 0;
              let tax = 0;
              let total = 0;

              ticketsToAdd.forEach(
                ({ subtotal: ticketSubtotal, tax: ticketTax, totalPrice: ticketTotal }) => {
                  subtotal += ticketSubtotal;
                  tax += ticketTax;
                  total += ticketTotal;
                }
              );

              return (
                <div style={{ display: 'flex' }}>
                  <Text style={{ marginRight: 10 }}>
                    Subtotal <Tag>{format.currency(subtotal)}</Tag>
                  </Text>
                  <Text style={{ marginRight: 10 }}>
                    Impuestos <Tag>{format.currency(tax)}</Tag>
                  </Text>
                  <Text style={{ marginRight: 10 }}>
                    Total <Tag>{format.currency(total)}</Tag>
                  </Text>
                </div>
              );
            }}
            size="small"
            scroll={{ x: true, y: '42vh' }}
            pagination={{ defaultPageSize: 40 }}
            dataSource={tickets.map(ticket => ({ ...ticket, key: shortid.generate() }))}
          />
        </Card>
      </TableContainer>
    </HistoryContainer>
  );
};

History.propTypes = {
  client: PropTypes.object.isRequired
};

export default withApollo(History);
