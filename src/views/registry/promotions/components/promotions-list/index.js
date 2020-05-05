import React from 'react';
import { withApollo } from 'react-apollo';
import { Button, Col, List, Row, Tag, Typography } from 'antd';
import PropTypes from 'prop-types';
import { Content, Title } from './elements';

const { Item } = List;
const { Text } = Typography;

const PromotionsList = ({
  loading,
  promotions,
  deletePromotion,
  disablePromotion,
  enablePromotion,
  setCurrentPromotion,
  togglePromotionModal
}) => {
  return (
    <>
      <List
        loading={loading}
        dataSource={promotions}
        renderItem={promotion => (
          <Item style={{ flexDirection: 'column', alignItems: 'initial' }} key={promotion.id}>
            <Title>
              <Text style={{ marginRight: 'auto' }} strong>
                {promotion.name}
              </Text>
              <>
                <Button
                  onClick={() => {
                    setCurrentPromotion(promotion);
                    togglePromotionModal(true);
                  }}
                  style={{ marginRight: 5 }}
                  icon="edit"
                  size="small"
                  type="primary"
                >
                  Editar
                </Button>
                <Button
                  onClick={() =>
                    promotion.disabled ? enablePromotion(promotion) : disablePromotion(promotion)
                  }
                  style={{ marginRight: 5 }}
                  icon={promotion.disabled ? 'up-circle' : 'down-circle'}
                  size="small"
                  type="default"
                >
                  {promotion.disabled ? 'Activar' : 'Desactivar'}
                </Button>
                <Button
                  onClick={() => deletePromotion(promotion)}
                  icon="close-circle"
                  size="small"
                  type="danger"
                >
                  Eliminar
                </Button>
              </>
            </Title>
            <Content>
              <Col style={{ flexGrow: 1, flexBasis: '70%', marginRight: 10 }}>
                <Row style={{ marginTop: 10 }}>
                  <Text type="secondary" style={{ marginRight: 10 }}>
                    Creador:
                  </Text>
                  <Text strong style={{ marginRight: 10 }}>
                    {promotion.createdBy.firstName} {promotion.createdBy.lastName}
                  </Text>
                </Row>
                <Row style={{ marginTop: 10 }}>
                  <Text type="secondary" style={{ marginRight: 10 }}>
                    Participantes:
                  </Text>
                  <Tag color="purple" style={{ marginRight: 10 }}>
                    {`${promotion.clients.length} ${
                      promotion.clients.length === 1 ? 'cliente' : 'clientes'
                    }`}
                  </Tag>
                  <Tag color="geekblue" style={{ marginRight: 10 }}>
                    {`${promotion.groups.length} ${
                      promotion.groups.length === 1 ? 'grupo' : 'grupos'
                    }`}
                  </Tag>
                </Row>
              </Col>
              <Col style={{ flexGrow: 1, flexBasis: '30%', marginTop: 20 }}>
                <Text strong>Detalles de la promoción:</Text>
                <Col style={{ marginTop: 10 }}>
                  <Row style={{ display: 'flex', marginTop: 5 }} key={promotion.product.rock.id}>
                    <Text style={{ marginRight: 'auto' }}>{promotion.product.rock.name}:</Text>
                    <Tag color="green">${promotion.product.price}MXN</Tag>
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

PromotionsList.propTypes = {
  loading: PropTypes.bool.isRequired,
  deletePromotion: PropTypes.func.isRequired,
  disablePromotion: PropTypes.func.isRequired,
  enablePromotion: PropTypes.func.isRequired,
  setCurrentPromotion: PropTypes.func.isRequired,
  togglePromotionModal: PropTypes.func.isRequired,
  promotions: PropTypes.arrayOf(PropTypes.object).isRequired
};

export default withApollo(PromotionsList);
