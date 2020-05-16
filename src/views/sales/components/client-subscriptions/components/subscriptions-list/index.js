import React, { useState } from 'react';
import { withApollo } from '@apollo/react-hoc';
import PropTypes from 'prop-types';
import moment from 'moment-timezone';
import { Button, Col, Form, List, message, Modal, Row, Tag, Typography } from 'antd';
import ClientSubscriptionForm from './components/client-subscription-form';
import SubscriptionWarningResolveForm from './components/subscription-warning-resolve-form';
import { Content, Title } from './elements';
import { DELETE_CLIENT_SUBSCRIPTION } from './graphql/mutations';

const { Item } = List;
const { Text } = Typography;
const { confirm } = Modal;

const SubscriptionsList = ({
  client,
  loading,
  updateFather,
  setClientSubscriptions,
  clientSubscriptions
}) => {
  const [currentSubscriptionEdit, setCurrentSubscriptionEdit] = useState();
  const [currentSubscriptionResolve, setCurrentSubscriptionResolve] = useState();

  const EditClientSubscriptionForm = Form.create({ name: 'client-subscription' })(
    ClientSubscriptionForm
  );
  const ClientSubscriptionWarningResolveForm = Form.create({
    name: 'client-subscription-warning-resolve'
  })(SubscriptionWarningResolveForm);

  const deleteClientSubscription = subscriptionToDelete => {
    confirm({
      title: '¿Estás seguro de que deseas cancelar el seguimiento de este cliente?',
      content: 'Una vez cancelado, ya no se podrá recuperar',
      okType: 'danger',
      onOk: async () => {
        await client.mutate({
          mutation: DELETE_CLIENT_SUBSCRIPTION,
          variables: { id: subscriptionToDelete.id }
        });

        setClientSubscriptions(
          clientSubscriptions.filter(({ id }) => id !== subscriptionToDelete.id)
        );

        message.success(
          `La suscripción ${subscriptionToDelete.client.businessName} ha sido removida`
        );
      },
      onCancel: () => {}
    });
  };

  return (
    <>
      <List
        loading={loading}
        dataSource={clientSubscriptions}
        renderItem={subscription => (
          <Item style={{ flexDirection: 'column', alignItems: 'initial' }} key={1}>
            <Title>
              <Text style={{ marginRight: 'auto', marginBottom: 10 }} strong>
                {`Cliente ${subscription.client.businessName}`}
              </Text>
              {subscription.isWarningActive && (
                <Button
                  onClick={() => setCurrentSubscriptionResolve(subscription)}
                  style={{ marginRight: 5 }}
                  icon="bulb"
                  size="small"
                  type="primary"
                >
                  Resolver
                </Button>
              )}
              {!subscription.isWarningActive && (
                <Button
                  onClick={() => setCurrentSubscriptionEdit(subscription)}
                  style={{ marginRight: 5 }}
                  icon="edit"
                  size="small"
                >
                  Editar
                </Button>
              )}
              <Button
                onClick={() => deleteClientSubscription(subscription)}
                style={{ marginRight: 5 }}
                icon="close-circle"
                size="small"
                type="danger"
              >
                Cancelar
              </Button>
            </Title>
            <Content>
              <Col style={{ flexGrow: 1, flexBasis: '70%', marginRight: 10 }}>
                <Row style={{ marginBottom: 5 }}>
                  <Text type="secondary" style={{ marginRight: 10 }}>
                    Email:
                  </Text>
                  <Text strong copyable style={{ marginRight: 10 }}>
                    {subscription.client?.email}
                  </Text>
                </Row>
                <Row style={{ marginBottom: 5 }}>
                  <Text type="secondary" style={{ marginRight: 10 }}>
                    Teléfono(s):
                  </Text>
                  {subscription.client.cellphone.map(number => (
                    <Tag color="green" key={number}>
                      <Text copyable style={{ marginRight: 5 }}>
                        {number}
                      </Text>
                    </Tag>
                  ))}
                </Row>
                <Row style={{ marginBottom: 5 }}>
                  <Text type="secondary" style={{ marginRight: 10 }}>
                    Período actual:
                  </Text>
                  <Text style={{ marginRight: 10 }}>
                    <Tag color="geekblue">{`${moment(subscription.start).format(
                      'DD MMMM YYYY'
                    )} a ${moment(subscription.end).format('DD MMMM YYYY')}`}</Tag>
                  </Text>
                </Row>
                <Row style={{ marginBottom: 5 }}>
                  <Text type="secondary" style={{ marginRight: 10 }}>
                    Meta:
                  </Text>
                  <Text style={{ marginRight: 10 }}>
                    <Text>{`${subscription.tons} ${
                      subscription.tons > 1 ? 'toneladas' : 'tonelada'
                    } cada ${subscription.days > 1 ? `${subscription.days} días` : 'día'}`}</Text>
                  </Text>
                </Row>
                <Row style={{ marginBottom: 5 }}>
                  <Text type="secondary" style={{ marginRight: 10 }}>
                    Margen:
                  </Text>
                  <Text style={{ marginRight: 10 }}>
                    <Text>{`${subscription.margin * 100} %`}</Text>
                  </Text>
                  <Text style={{ marginRight: 10 }}>
                    <Text mark>{`consumo mínimo de ${subscription.tons *
                      (1 - subscription.margin)} toneladas`}</Text>
                  </Text>
                </Row>
                <Row style={{ marginBottom: 5 }}>
                  <Text type="secondary" style={{ marginRight: 10 }}>
                    Solicitante:
                  </Text>
                  <Text style={{ marginRight: 10 }}>
                    {subscription.requestedBy.firstName} {subscription.requestedBy.lastName}
                  </Text>
                </Row>
              </Col>
            </Content>
          </Item>
        )}
      />
      {currentSubscriptionResolve && (
        <ClientSubscriptionWarningResolveForm
          close={() => setCurrentSubscriptionResolve(undefined)}
          updateFather={updateFather}
          currentSubscription={currentSubscriptionResolve}
        />
      )}
      {currentSubscriptionEdit && (
        <EditClientSubscriptionForm
          close={() => setCurrentSubscriptionEdit(undefined)}
          updateFather={updateFather}
          currentSubscription={currentSubscriptionEdit}
        />
      )}
    </>
  );
};

SubscriptionsList.propTypes = {
  client: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired,
  updateFather: PropTypes.func.isRequired,
  setClientSubscriptions: PropTypes.func.isRequired,
  clientSubscriptions: PropTypes.array.isRequired
};

export default withApollo(SubscriptionsList);
