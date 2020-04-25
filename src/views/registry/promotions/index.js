import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { withApollo } from 'react-apollo';
import { Button, Form, message, Modal, notification, Tabs, Typography } from 'antd';
import PromotionModal from './components/promotion-modal';
import PromotionsList from './components/promotions-list';
import { Card, ListContainer, TitleContainer } from './elements';
import { GET_PROMOTIONS } from './graphql/queries';
import { DELETE_PROMOTION, DISABLE_PROMOTION, ENABLE_PROMOTION } from './graphql/mutations';

const { confirm } = Modal;
const { Title } = Typography;
const { TabPane } = Tabs;

const Promotions = ({ client }) => {
  const [isPromotionModalOpen, togglePromotionModal] = useState(false);
  const [promotions, setPromotions] = useState([]);
  const [currentPromotion, setCurrentPromotion] = useState();
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: 'ACTIVE' });

  useEffect(() => {
    const getPromotions = async () => {
      const { data, errors } = await client.query({
        query: GET_PROMOTIONS,
        variables: { filters }
      });

      setLoading(false);

      if (errors) {
        message.error('Ocurrió un error obteniendo las promociones');
        return;
      }

      setPromotions(data.promotions);
    };

    getPromotions();
  }, [client, filters, loading]);

  const deletePromotion = promotionToDelete => {
    confirm({
      title: '¿Estás seguro de que deseas eliminar esta promoción?',
      content: 'Una vez eliminado, ya no aplicará en futuras boletas',
      okType: 'danger',
      onOk: async () => {
        await client.mutate({
          mutation: DELETE_PROMOTION,
          variables: { id: promotionToDelete.id }
        });

        setPromotions(promotions.filter(({ id }) => id !== promotionToDelete.id));

        notification.open({
          message: `La promoción ${promotionToDelete.name} ha sido removida!`
        });
      },
      onCancel: () => {}
    });
  };

  const disablePromotion = promotionToDisable => {
    confirm({
      title: '¿Estás seguro de que deseas deshabilitar esta promoción?',
      content: 'Una vez deshabilitada, ya no aplicará en futuras boletas, hasta que se reactive',
      okType: 'danger',
      onOk: async () => {
        await client.mutate({
          mutation: DISABLE_PROMOTION,
          variables: { id: promotionToDisable.id }
        });

        setPromotions(promotions.filter(({ id }) => id !== promotionToDisable.id));

        notification.open({
          message: `La promoción ${promotionToDisable.name} ha sido deshabilitada exitosamente!`
        });
      },
      onCancel: () => {}
    });
  };

  const enablePromotion = promotionToEnable => {
    confirm({
      title: '¿Estás seguro de que deseas recuperar esta promoción?',
      content: 'Una vez recuperada, será aplicable en futuras boletas',
      onOk: async () => {
        await client.mutate({
          mutation: ENABLE_PROMOTION,
          variables: { id: promotionToEnable.id }
        });

        setPromotions(promotions.filter(({ id }) => id !== promotionToEnable.id));

        notification.open({
          message: `La promoción ${promotionToEnable.name} ha sido recuperada exitosamente!`
        });
      },
      onCancel: () => {}
    });
  };

  const PromotionModalForm = Form.create({ name: 'new-promotion' })(PromotionModal);

  return (
    <>
      <ListContainer>
        <TitleContainer>
          <Title level={3}>Lista de promociones</Title>
          <Button onClick={() => togglePromotionModal(true)} type="primary" icon="scissor">
            Crear promoción
          </Button>
        </TitleContainer>
        <Card>
          <Tabs
            animated={false}
            onChange={status => setFilters({ ...filters, status })}
            defaultActiveKey="ACTIVE"
          >
            <TabPane tab="ACTIVAS" key="ACTIVE" />
            <TabPane tab="INACTIVAS" key="INACTIVE" />
            <TabPane tab="PASADAS" key="ARCHIVED" />
          </Tabs>
          <PromotionsList
            deletePromotion={deletePromotion}
            disablePromotion={disablePromotion}
            enablePromotion={enablePromotion}
            setCurrentPromotion={setCurrentPromotion}
            togglePromotionModal={togglePromotionModal}
            updateFather={() => setLoading(true)}
            loading={loading}
            promotions={promotions}
          />
        </Card>
      </ListContainer>
      {isPromotionModalOpen && (
        <PromotionModalForm
          currentPromotion={currentPromotion}
          visible={isPromotionModalOpen}
          setCurrentPromotion={setCurrentPromotion}
          togglePromotionModal={togglePromotionModal}
          updateFather={() => setLoading(true)}
        />
      )}
    </>
  );
};

Promotions.propTypes = {
  client: PropTypes.object.isRequired
};

export default withApollo(Promotions);
