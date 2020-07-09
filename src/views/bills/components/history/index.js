import React, { useEffect, useState } from 'react';
import { withApollo } from 'react-apollo';
import { useDebounce } from 'use-lodash-debounce';
import PropTypes from 'prop-types';
import moment from 'moment-timezone';
import { useAuth } from 'components/providers/withAuth';
import { format, printPDF } from 'utils/functions';
import shortid from 'shortid';
import { Button, Modal, notification, Row, Table, Tag, Tooltip } from 'antd';
import Title from './components/title';
import { Card, TableContainer } from './elements';
import { GET_BILLS, GET_PDF } from './graphql/queries';
import { DELETE_BILL } from './graphql/mutations';

const { confirm } = Modal;

const History = ({ client }) => {
  const [loading, setLoading] = useState(true);
  const [bills, setBills] = useState([]);
  const [filters, setFilters] = useState({ search: '' });
  const debouncedFilters = useDebounce(filters, 1000);

  const { isAdmin, isManager, isAccountant, isCollector, isCollectorAux } = useAuth();

  const handleFilterChange = (key, value) => {
    const filtersToSet = { ...filters, [key]: value };

    setFilters(filtersToSet);
  };

  const deleteBill = billToDelete => {
    confirm({
      title: '¿Estás seguro de que deseas eliminar esta factura?',
      content:
        'Una vez eliminada ya no sera posible recuperarla, y sus boletas asociadas regresarán a estar disponibles para agrupar.',
      okType: 'danger',
      onOk: async () => {
        await client.mutate({
          mutation: DELETE_BILL,
          variables: { id: billToDelete.id }
        });

        setBills(bills.filter(({ id }) => id !== billToDelete.id));

        notification.open({
          message: `La factura ${billToDelete.folio} ha sido removida`
        });
      },
      onCancel: () => {}
    });
  };

  useEffect(() => {
    const getData = async () => {
      try {
        setLoading(true);
        const {
          data: { bills: billsToSet }
        } = await client.query({
          query: GET_BILLS,
          variables: { filters: debouncedFilters }
        });

        setBills(billsToSet);
        setLoading(false);
      } catch (e) {
        notification.open({
          message: 'No se han podido cargar las boletas correctamente.'
        });
      }
    };

    getData();
  }, [debouncedFilters, client]);

  const downloadPDF = async ({ id }) => {
    const {
      data: { billPDF }
    } = await client.query({
      query: GET_PDF,
      variables: {
        id
      }
    });

    printPDF(billPDF);
  };

  const columns = [
    {
      title: 'Fecha',
      dataIndex: 'date',
      key: 'date',
      render: date => moment(date).format('YYYY-MM-DD HH:MM:SS')
    },
    {
      title: 'Folio',
      dataIndex: 'folio',
      key: 'folio',
      render: folio => <Tag>{folio}</Tag>
    },
    {
      title: 'Cliente',
      dataIndex: 'client',
      key: 'client',
      render: ({ businessName }) => businessName
    },
    {
      title: 'Días de crédito',
      dataIndex: 'creditDays',
      key: 'creditDays'
    },
    {
      title: 'Tipo',
      dataIndex: 'bill',
      key: 'bill',
      render: bill => (bill ? <Tag color="green">FACTURA</Tag> : <Tag color="blue">REMISIÓN</Tag>)
    },
    {
      title: 'Impuestos',
      dataIndex: 'tax',
      key: 'tax',
      render: tax => format.currency(tax)
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      render: total => format.currency(total)
    },
    {
      title: 'Acciones',
      key: 'actions',
      align: 'right',
      render: row => (
        <Row>
          <Tooltip placement="top" title="Imprimir">
            <Button
              style={{ marginRight: 5 }}
              onClick={() => downloadPDF(row)}
              type="primary"
              icon="printer"
              size="small"
            />
          </Tooltip>
          {(isAdmin || isManager || isAccountant || isCollector || isCollectorAux) && (
            <Tooltip placement="top" title="Eliminar">
              <Button onClick={() => deleteBill(row)} type="danger" icon="delete" size="small"/>
            </Tooltip>
          )}
        </Row>
      )
    }
  ];

  return (
    <TableContainer>
      <Card>
        <Table
          loading={loading}
          columns={columns}
          title={() => <Title handleFilterChange={handleFilterChange} />}
          size="small"
          pagination={{ defaultPageSize: 20 }}
          dataSource={bills.map(billMapped => ({ ...billMapped, key: shortid.generate() }))}
        />
      </Card>
    </TableContainer>
  );
};

History.propTypes = {
  client: PropTypes.object.isRequired
};

export default withApollo(History);
