import React, { useState } from 'react';
import { useAuth } from 'components/providers/withAuth';
import { withApollo } from 'react-apollo';
import moment from 'moment';
import { List, Typography, Tag, Row, Col, Button, message, Modal } from 'antd';
import PropTypes from 'prop-types';
import { Content, Title } from './elements';
import UserPricesModal from './components/user-prices-modal';
import { EDIT_PRICE_REQUEST } from './graphql/mutations';

const { Item } = List;
const { confirm } = Modal;
const { Text } = Typography;

const PriceRequestsList = ({ loading, priceRequests, updateFather, client }) => {
  const { isAdmin, isAccountant } = useAuth();
  const [currentClientId, setCurrentClientId] = useState();
  const [isUserPricesModalOpen, toggleUserPricesModal] = useState(false);

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
            priceRequest: {
              id,
              status
            }
          }
        });

        if (status === 'ACCEPTED')
          message.success('Está solicitud fué aprobada y los cambios aplicados al cliente');
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
          client: beneficiary,
          createdAt,
          reviewedBy,
          reviewedAt,
          prices,
          status
        }) => (
          <Item style={{ flexDirection: 'column', alignItems: 'initial' }} key={id}>
            <Title>
              <Text style={{ marginRight: 'auto' }} strong>
                Datos de la solicitud
              </Text>
              {status === 'PENDING' && isAdmin && (
                <>
                  {/* <Button style={{ marginRight: 5 }} icon="edit" size="small" /> */}
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
                    <Text type="secondary" style={{ marginRight: 10 }}>
                      Solicitante:
                    </Text>
                    <Text style={{ marginRight: 10 }}>
                      {requester.firstName} {requester.lastName}
                    </Text>
                  </Row>
                  <Row>
                    <Text type="secondary" style={{ marginRight: 10 }}>
                      Cliente:
                    </Text>
                    <Button
                      style={{ marginRight: 10 }}
                      onClick={() => {
                        toggleUserPricesModal(true);
                        setCurrentClientId(beneficiary.id);
                      }}
                      type="link"
                    >
                      {beneficiary.businessName}
                    </Button>
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
                <Text strong>Precios solicitados</Text>
                <Col style={{ marginTop: 10 }}>
                  {prices.map(({ rock, priceRequested }) => (
                    <Row style={{ display: 'flex', marginTop: 5 }} key={rock.id}>
                      <Text style={{ marginRight: 'auto' }}>{rock.name}:</Text>
                      <Tag color="blue">${priceRequested}MXN</Tag>
                    </Row>
                  ))}
                </Col>
              </Col>
            </Content>
          </Item>
        )}
      />
      <UserPricesModal
        userId={currentClientId}
        visible={isUserPricesModalOpen}
        toggleUserPricesModal={toggleUserPricesModal}
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
