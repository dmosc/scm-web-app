import React from 'react';
import { useAuth } from 'components/providers/withAuth';
import { withApollo } from 'react-apollo';
import moment from 'moment-timezone';
import { Button, Col, List, message, Modal, Row, Tag, Typography } from 'antd';
import PropTypes from 'prop-types';
import { Content, Title } from './elements';
import { EDIT_PRICE_REQUEST } from './graphql/mutations';

const { Item } = List;
const { confirm } = Modal;
const { Text } = Typography;

const PriceRequestsList = ({ loading, priceRequests, updateFather, client }) => {
  const { isAdmin, isAccountant } = useAuth();

  const getStatusColor = status => {
    switch (status) {
      case 'REJECTED':
        return 'red';
      case 'ACCEPTED':
        return 'green';
      default:
        return 'orange';
    }
  };

  const updateStatus = async (id, status) => {
    const action = status === 'ACCEPTED' ? 'aceptar' : 'rechazar';
    confirm({
      title: `¿Estás seguro de que deseas ${action} esta solicitud?`,
      content: `Al ${action}, ya no podrá cambiarse su status final`,
      onOk: async () => {
        await client.mutate({
          mutation: EDIT_PRICE_REQUEST,
          variables: {
            rockPriceRequest: {
              id,
              status
            }
          }
        });

        if (status === 'ACCEPTED')
          message.success('Está solicitud fué aprobada y los cambios aplicados al producto');
        else message.success('Está solicitud fué rechazada');

        updateFather();
      },
      onCancel: () => {}
    });
  };

  return (
    <>
      <List
        loading={loading}
        dataSource={priceRequests}
        renderItem={({
          id,
          requester,
          rock,
          createdAt,
          reviewedBy,
          reviewedAt,
          priceRequested,
          floorPriceRequested,
          status
        }) => (
          <Item style={{ flexDirection: 'column', alignItems: 'initial' }} key={id}>
            <Title>
              <Text style={{ marginRight: 'auto' }} strong>
                Datos de la solicitud
              </Text>
              {status === 'PENDING' && isAdmin && (
                <>
                  {!isAccountant && (
                    <>
                      <Button
                        onClick={() => updateStatus(id, 'REJECTED')}
                        style={{ marginRight: 5 }}
                        icon="close-circle"
                        size="small"
                        type="danger"
                      >
                        Rechazar
                      </Button>
                      <Button
                        onClick={() => updateStatus(id, 'ACCEPTED')}
                        icon="check-circle"
                        size="small"
                        type="primary"
                      >
                        Aceptar
                      </Button>
                    </>
                  )}
                </>
              )}
            </Title>
            <Content>
              <Col style={{ flexGrow: 1, flexBasis: '70%', marginRight: 10 }}>
                <Row style={{ marginTop: 10 }}>
                  <Row>
                    <Row>
                      <Text type="secondary" style={{ marginRight: 10 }}>
                        Producto:
                      </Text>
                      <Tag color="blue">{rock.name}</Tag>
                    </Row>
                    <Text type="secondary" style={{ marginRight: 10 }}>
                      Solicitante:
                    </Text>
                    <Text style={{ marginRight: 10 }}>
                      {requester.firstName} {requester.lastName}
                    </Text>
                  </Row>
                  <Row>
                    <Text type="secondary" style={{ marginRight: 10 }}>
                      Status:
                    </Text>
                    <Tag color={getStatusColor(status)}>{status}</Tag>
                  </Row>
                  <Row>
                    <Text type="secondary" style={{ marginRight: 10 }}>
                      Fecha de creación:
                    </Text>
                    <Tag color="green">{moment(createdAt).format('lll')}</Tag>
                  </Row>
                  {reviewedBy && (
                    <Row>
                      <Text type="secondary" style={{ marginRight: 10 }}>
                        Revisado por:
                      </Text>
                      <Text style={{ marginRight: 10 }}>
                        {reviewedBy.firstName} {reviewedBy.lastName}
                      </Text>
                    </Row>
                  )}
                  {reviewedAt && (
                    <Row>
                      <Text type="secondary" style={{ marginRight: 10 }}>
                        Fecha de revisión:
                      </Text>
                      <Tag color="green">{moment(reviewedAt).format('lll')}</Tag>
                    </Row>
                  )}
                </Row>
              </Col>
              <Col style={{ flexGrow: 1, flexBasis: '30%' }}>
                <Text strong>Precios solicitado para {rock.name}</Text>
                <Col style={{ marginTop: 10 }}>
                  <Row style={{ display: 'flex', marginTop: 5 }}>
                    <Text style={{ marginRight: 'auto' }}>Precio general:</Text>
                    <Tag color="blue">${priceRequested}MXN</Tag>
                  </Row>
                </Col>
                <Col style={{ marginTop: 10 }}>
                  <Row style={{ display: 'flex', marginTop: 5 }}>
                    <Text style={{ marginRight: 'auto' }}>Precio piso:</Text>
                    <Tag color="blue">${floorPriceRequested}MXN</Tag>
                  </Row>
                </Col>
              </Col>
            </Content>
          </Item>
        )}
      />
    </>
  );
};

PriceRequestsList.propTypes = {
  client: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired,
  updateFather: PropTypes.func.isRequired,
  priceRequests: PropTypes.arrayOf(PropTypes.object).isRequired
};

export default withApollo(PriceRequestsList);
