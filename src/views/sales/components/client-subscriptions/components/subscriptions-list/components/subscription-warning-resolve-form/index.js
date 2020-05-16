import React, { useEffect, useState } from 'react';
import { withApollo } from '@apollo/react-hoc';
import PropTypes from 'prop-types';
import moment from 'moment-timezone';
import warningReasons from 'utils/enums/warning-reasons';
import {
  Button,
  Divider,
  Form,
  Input,
  message,
  Modal,
  Progress,
  Select,
  Tag,
  Typography
} from 'antd';
import { RESOLVE_SUBSCRIPTION_WARNING } from './graphql/mutation';
import { GET_SUBSCRIPTION_WARNING } from './graphql/queries';

const { Option } = Select;
const { TextArea } = Input;
const { Text } = Typography;

const SubscriptionWarningResolveForm = ({
  form,
  client,
  updateFather,
  currentSubscription,
  close
}) => {
  const [loading, setLoading] = useState(false);
  const [clientSubscriptionWarning, setClientSubscriptionWarning] = useState();

  useEffect(() => {
    const getClientSubscriptionWarning = async () => {
      const { data, errors } = await client.query({
        query: GET_SUBSCRIPTION_WARNING,
        variables: { id: currentSubscription.id }
      });

      if (!errors) {
        setClientSubscriptionWarning(data.clientSubscriptionWarning);
      } else {
        message.error('Ha habido un error cargando la alerta correspondiente!');
      }
    };

    getClientSubscriptionWarning();
  }, [client, currentSubscription, clientSubscriptionWarning]);

  const handleSubmit = e => {
    e.preventDefault();

    setLoading(true);
    form.validateFields(async (err, args) => {
      if (!err) {
        const {
          data: { clientSubscriptionWarningResolve },
          errors
        } = await client.mutate({
          mutation: RESOLVE_SUBSCRIPTION_WARNING,
          variables: { clientSubscriptionWarning: { ...args, id: clientSubscriptionWarning.id } }
        });

        if (!errors) {
          const { firstName, lastName } = clientSubscriptionWarningResolve.resolvedBy;
          message.success(
            `Se ha resuelto exitosamente la alerta de seguimiento por ${firstName} ${lastName}`
          );
        } else {
          errors.forEach(error => message.error(error.message));
        }

        close();
        setLoading(false);
        updateFather();
      } else {
        setLoading(false);
      }
    });
  };

  const percent = ((clientSubscriptionWarning?.tons / currentSubscription?.tons) * 100).toFixed(2);
  return (
    <Modal
      title={`Resolviendo alerta de seguimiento de cliente ${currentSubscription.client.businessName}`}
      visible
      cancelButtonProps={{ style: { display: 'none' } }}
      onCancel={close}
      onOk={close}
      width={650}
      footer={null}
    >
      <Form onSubmit={handleSubmit}>
        <Form.Item style={{ marginBottom: 0 }}>
          <Text type="secondary" style={{ marginRight: 10 }}>
            Período de alerta:
          </Text>
          <Text>
            <Tag color="volcano">{`${moment(clientSubscriptionWarning?.start).format(
              'DD MMMM YYYY'
            )} a ${moment(clientSubscriptionWarning?.end).format('DD MMMM YYYY')}`}</Tag>
          </Text>
        </Form.Item>
        <Form.Item style={{ marginBottom: 0 }}>
          <Text type="secondary" style={{ marginRight: 10 }}>
            Consumo esperado:
          </Text>
          <Text style={{ marginRight: 10 }}>
            <Text>{`${currentSubscription?.tons} toneladas`}</Text>
          </Text>
        </Form.Item>
        <Form.Item style={{ marginBottom: 0 }}>
          <Text type="secondary" style={{ marginRight: 10 }}>
            Consumo mínimo:
          </Text>
          <Text style={{ marginRight: 10 }}>
            <Text>{`${currentSubscription?.tons *
              (1 - currentSubscription?.margin)} toneladas`}</Text>
          </Text>
        </Form.Item>
        <Form.Item style={{ marginBottom: 0 }}>
          <Text type="secondary" style={{ marginRight: 10 }}>
            Situación:
          </Text>
          <Text>
            {`El cliente consumió ${clientSubscriptionWarning?.tons} toneladas de las ${currentSubscription?.tons} esperadas`}
          </Text>
        </Form.Item>
        <Form.Item>
          <Progress
            style={{ width: '95%' }}
            strokeColor={percent > 50 ? 'gold' : 'red'}
            percent={percent}
            status="active"
          />
        </Form.Item>
        <Form.Item>
          <Divider style={{ marginTop: 0 }} orientation="left">
            Justificación de alerta
          </Divider>
          {form.getFieldDecorator('reason')(
            <Select placeholder="Razón de alerta">
              {Object.keys(warningReasons).map(key => (
                <Option key={key} value={key}>
                  {`${warningReasons[key]}`}
                </Option>
              ))}
            </Select>
          )}
        </Form.Item>
        <Form.Item>
          <Divider style={{ marginTop: 0 }} orientation="left">
            Comentarios
          </Divider>
          {form.getFieldDecorator('comments')(
            <TextArea
              autoSize={{ minRows: 4, maxRows: 6 }}
              placeholder="Resolución de la sitación"
            />
          )}
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" icon="save" loading={loading}>
            {(loading && 'Espere...') || 'Guardar'}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

SubscriptionWarningResolveForm.propTypes = {
  form: PropTypes.object.isRequired,
  client: PropTypes.object.isRequired,
  updateFather: PropTypes.func.isRequired,
  currentSubscription: PropTypes.object.isRequired,
  close: PropTypes.func.isRequired
};

export default withApollo(SubscriptionWarningResolveForm);
