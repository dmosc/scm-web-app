import React, { useEffect, useState } from 'react';
import { withApollo } from '@apollo/react-hoc';
import { useDebounce } from 'use-lodash-debounce';
import moment from 'moment';
import PropTypes from 'prop-types';
import shortid from 'shortid';
import { Button, notification, Table, Tag } from 'antd';
import Title from './components/title';
import { HistoryContainer, TableContainer, Card } from './elements';
import { GET_HISTORY_TICKETS } from './graphql/queries';

const History = ({ client }) => {
  const [filters, setFilters] = useState({
    search: '',
    start: null,
    end: null,
    date: null,
    type: null,
    product: ''
  });
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState([]);
  const debouncedFilters = useDebounce(filters, 1000);

  const handleFilterChange = (key, value) => {
    // eslint-disable-next-line no-param-reassign
    if (key === 'type' && value === '') value = null;
    const filtersToSet = { ...filters, [key]: value };

    setFilters(filtersToSet);
  };

  const handleDateFilterChange = dates => {
    const start = dates[0];
    const end = dates[1];

    // This is a special case when 'De hoy' filter is set
    // and, since start and end are equal, nothing is returned
    // because nothing is between to equal dates
    if (start && end && start.toString() === end.toString()) {
      setFilters({ ...filters, start: null, end: null, date: start });
    } else {
      setFilters({ ...filters, start, end });
    }
  };

  useEffect(() => {
    const getData = async () => {
      try {
        setLoading(true);
        const {
          data: { archivedTickets }
        } = await client.query({
          query: GET_HISTORY_TICKETS,
          variables: { filters: debouncedFilters }
        });

        const archivedTicketsToSet = archivedTickets.map(ticket => ({
          ...ticket,
          subtotal: ticket.total - ticket.tax
        }));

        setTickets(archivedTicketsToSet);
        setLoading(false);
      } catch (e) {
        notification.open({
          message: '¡No se han podido cargar las boletas correctamente!'
        });
      }
    };

    getData();
  }, [debouncedFilters, client]);

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
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 130,
      fixed: 'left',
      render: createdAt => (
        <>
          <Tag color="geekblue">{moment(createdAt).format('DD/MM/YYYY')}</Tag>
          <Tag color="purple">{moment(createdAt).format('HH:MM A')}</Tag>
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
      title: 'Dirección',
      dataIndex: 'address',
      key: 'address',
      width: 100
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
      dataIndex: 'totalWeight',
      key: 'totalWeight',
      width: 100
    },
    {
      title: 'Peso neto',
      dataIndex: 'tons',
      key: 'tons',
      width: 100
    },
    {
      title: 'Subtotal',
      dataIndex: 'subtotal',
      key: 'subtotal',
      width: 100,
      fixed: 'right',
      render: subtotal => <Tag>{`$${subtotal.toFixed(2)}`}</Tag>
    },
    {
      title: 'Impuesto',
      dataIndex: 'tax',
      key: 'tax',
      width: 100,
      fixed: 'right',
      render: tax => <Tag>{`$${tax.toFixed(2)}`}</Tag>
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      width: 100,
      fixed: 'right',
      render: total => <Tag>{`$${total.toFixed(2)}`}</Tag>
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
                handleFilterChange={handleFilterChange}
                handleDateFilterChange={handleDateFilterChange}
              />
            )}
            size="small"
            scroll={{ x: true, y: '55vh' }}
            pagination={{ defaultPageSize: 20 }}
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
