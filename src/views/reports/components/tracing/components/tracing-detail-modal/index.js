import React, { useEffect, useState } from 'react';
import { withApollo } from '@apollo/react-hoc';
import moment from 'moment-timezone';
import { format } from 'utils/functions';
import PropTypes from 'prop-types';
import { Drawer, Tag, Row, Tooltip, Button, Table, Card } from 'antd';
import DailyTicketsModal from './components/daily-tickets-modal';
import { GET_DAILY_TRACING } from './graphql/queries';

const TracingDetailModal = ({ client, clientToTrace, visible, onClose, date }) => {
  const [dailyPurchases, setDailyPurchases] = useState([]);
  const [loading, setLoading] = useState();
  const [day, setDay] = useState();

  useEffect(() => {
    const getDaily = async () => {
      if (clientToTrace?.id) {
        setLoading(true);
        const range =
          date.end && date.start
            ? {
                start: date.start,
                end: date.end
              }
            : undefined;
        const {
          data: { clientTracingDaily }
        } = await client.query({
          query: GET_DAILY_TRACING,
          variables: {
            clientId: clientToTrace.id,
            range
          }
        });
        setDailyPurchases(clientTracingDaily);
        setLoading(false);
      } else {
        setDailyPurchases([]);
      }
    };

    getDaily();
  }, [client, clientToTrace, date]);

  const columns = [
    {
      title: 'Dia',
      dataIndex: 'date',
      render: purchasesDate => moment(purchasesDate).format('ll'),
      key: 'date',
      fixed: 'left',
      width: 200
    },
    {
      title: 'Boletas',
      dataIndex: 'ticketsQty',
      key: 'ticketsQty',
      render: ticketsQty => <Tag color="geekblue">{ticketsQty}</Tag>
    },
    {
      title: 'Toneladas compradas',
      dataIndex: 'totalWeight',
      key: 'totalWeight',
      render: totalWeight => <Tag color="geekblue">{format.number(totalWeight)}</Tag>
    },
    {
      title: 'Subtotal',
      dataIndex: 'subtotal',
      key: 'subtotal',
      render: subtotal => <Tag color="geekblue">{format.currency(subtotal)}</Tag>
    },
    {
      title: 'Impuestos',
      dataIndex: 'totalTaxes',
      key: 'totalTaxes',
      render: totalTaxes => <Tag color="geekblue">{format.currency(totalTaxes)}</Tag>
    },
    {
      title: 'Total',
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
              onClick={() =>
                setDay({
                  start: moment(row.date),
                  end: moment(row.date).add(1, 'day')
                })
              }
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
      <Drawer
        title={`Compras diarias de ${clientToTrace?.businessName} del ${moment(date.start).format(
          'll'
        )} al ${moment(date.end).format('ll')}`}
        placement="right"
        onClose={onClose}
        footer={null}
        width="90%"
        visible={visible}
      >
        <Card bordered={false}>
          <Table
            loading={loading}
            pagination={{ defaultPageSize: 20 }}
            columns={columns}
            dataSource={dailyPurchases}
            size="small"
            rowKey={({ date: purchasesDate }) => purchasesDate}
          />
        </Card>
      </Drawer>
      <DailyTicketsModal
        day={day}
        visible={!!day}
        onClose={() => setDay(null)}
        clientToTrace={clientToTrace}
      />
    </>
  );
};

TracingDetailModal.defaultProps = {
  clientToTrace: {}
};

TracingDetailModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  client: PropTypes.object.isRequired,
  clientToTrace: PropTypes.shape({
    id: PropTypes.string,
    businessName: PropTypes.string
  }),
  date: PropTypes.shape({
    start: PropTypes.any,
    end: PropTypes.any
  }).isRequired,
  onClose: PropTypes.func.isRequired
};

export default withApollo(TracingDetailModal);
