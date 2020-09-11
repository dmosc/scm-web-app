import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { withApollo } from '@apollo/react-hoc';
import { Table, Card, Tag, Button, Row, Tooltip } from 'antd';
import { format } from 'utils/functions';
import TableTitle from './components/title';
import TracingDetailModal from './components/tracing-detail-modal';
import { GET_TRACING } from './graphql/queries';

const Tracing = ({ client, globalFilters }) => {
  const [clientsTracing, setClientsTracing] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState({
    field: 'total',
    order: 'desc'
  });
  const [clientToTrace, setClientToTrace] = useState(null);

  useEffect(() => {
    const getData = async () => {
      setLoading(true);
      const range =
        globalFilters.end && globalFilters.start
          ? {
              start: globalFilters.start,
              end: globalFilters.end
            }
          : undefined;
      const {
        data: { clientsTracing: toSet }
      } = await client.query({
        query: GET_TRACING,
        variables: {
          range,
          sortBy
        }
      });
      setLoading(false);

      setClientsTracing(toSet);
    };

    getData();
  }, [client, globalFilters, sortBy]);

  const columns = [
    {
      title: 'ID',
      dataIndex: 'client',
      render: ({ uniqueId }) => uniqueId,
      key: 'client.uniqueId',
      fixed: 'left',
      width: 200
    },
    {
      title: 'Negocio',
      dataIndex: 'client',
      render: ({ businessName }) => businessName,
      key: 'client.businessName',
      fixed: 'left',
      width: 200
    },
    {
      title: 'Nombre',
      dataIndex: 'client',
      render: ({ firstName }) => firstName,
      key: 'client.firstName'
    },
    {
      title: 'Apellidos',
      dataIndex: 'client',
      render: ({ lastName }) => lastName,
      key: 'client.lastName'
    },
    {
      title: 'Boletas',
      dataIndex: 'ticketsQty',
      key: 'ticketsQty',
      render: ticketsQty => <Tag color="geekblue">{format.number(ticketsQty)}</Tag>
    },
    {
      title: 'Toneladas compradas',
      dataIndex: 'totalWeight',
      key: 'totalWeight',
      render: totalWeight => <Tag color="geekblue">{format.number(totalWeight)}</Tag>
    },
    {
      title: 'Subtotal del periodo',
      dataIndex: 'subtotal',
      key: 'subtotal',
      render: subtotal => <Tag color="geekblue">{format.currency(subtotal)}</Tag>
    },
    {
      title: 'Impuestos del periodo',
      dataIndex: 'totalTaxes',
      key: 'totalTaxes',
      render: totalTaxes => <Tag color="geekblue">{format.currency(totalTaxes)}</Tag>
    },
    {
      title: 'Total del periodo',
      dataIndex: 'total',
      key: 'total',
      render: total => <Tag color="geekblue">{format.currency(total)}</Tag>
    },
    {
      title: 'Acciones',
      key: 'action',
      align: 'right',
      fixed: 'right',
      render: row => (
        <Row>
          <Tooltip placement="top" title="Detalle">
            <Button
              onClick={() => setClientToTrace(row.client)}
              type="primary"
              icon="eye"
              size="small"
            />
          </Tooltip>
        </Row>
      )
    }
  ];

  return (
    <>
      <Card bordered={false}>
        <Table
          loading={loading}
          title={() => <TableTitle sortBy={sortBy} setSortBy={setSortBy} />}
          pagination={{ defaultPageSize: 20 }}
          columns={columns}
          dataSource={clientsTracing}
          size="small"
          rowKey={({ client: { id } }) => id}
        />
      </Card>
      <TracingDetailModal
        clientToTrace={clientToTrace}
        visible={!!clientToTrace}
        date={{
          start: globalFilters.start,
          end: globalFilters.end
        }}
        onClose={() => setClientToTrace(null)}
      />
    </>
  );
};

Tracing.propTypes = {
  client: PropTypes.object.isRequired,
  globalFilters: PropTypes.object.isRequired
};

export default withApollo(Tracing);
