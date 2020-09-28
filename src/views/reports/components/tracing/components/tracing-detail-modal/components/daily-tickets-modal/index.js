import React, { useEffect, useState } from 'react';
import { withApollo } from '@apollo/react-hoc';
import moment from 'moment-timezone';
import PropTypes from 'prop-types';
import { format } from 'utils/functions';
import { Modal, Collapse, Icon, Row, Statistic, Col, Spin } from 'antd';
import { GET_TICKETS_IN_RANGE } from './graphql/queries';

const { Panel } = Collapse;

const TracingDetailModal = ({ client, clientToTrace, visible, onClose, day }) => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState();

  useEffect(() => {
    const getDaily = async () => {
      if (visible) {
        setLoading(true);
        const range =
          day.end && day.start
            ? {
                start: day.start,
                end: day.end
              }
            : undefined;
        const {
          data: { ticketsByClient }
        } = await client.query({
          query: GET_TICKETS_IN_RANGE,
          variables: {
            clientId: clientToTrace.id,
            range
          }
        });
        setTickets(ticketsByClient);
        setLoading(false);
      } else {
        setTickets([]);
      }
    };

    getDaily();
  }, [visible, day, clientToTrace, client]);

  return (
    <Modal
      title={`Compras de ${clientToTrace?.businessName} del ${moment(day?.start).format('ll')}`}
      onCancel={onClose}
      footer={null}
      width="80%"
      visible={visible}
    >
      {loading ? (
        <div style={{ display: 'flex', alingItems: 'center', justifyContent: 'center' }}>
          <Spin />
        </div>
      ) : (
        <Collapse
          expandIcon={({ isActive }) => <Icon type="caret-right" rotate={isActive ? 90 : 0} />}
        >
          {tickets.map(ticket => (
            <Panel key={ticket.id} header={ticket.folio} extra={ticket.product.name}>
              <Row style={{ margin: 5, padding: 10 }} gutter={{ xs: 8, sm: 16, md: 24 }}>
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
      )}
    </Modal>
  );
};

TracingDetailModal.defaultProps = {
  clientToTrace: {},
  day: {}
};

TracingDetailModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  client: PropTypes.object.isRequired,
  clientToTrace: PropTypes.shape({
    id: PropTypes.string,
    businessName: PropTypes.string
  }),
  day: PropTypes.shape({
    start: PropTypes.any,
    end: PropTypes.any
  }),
  onClose: PropTypes.func.isRequired
};

export default withApollo(TracingDetailModal);
