import React, { useState } from 'react';
import { withApollo } from '@apollo/react-hoc';
import moment from 'moment-timezone';
import { Button, DatePicker, Divider, Form, Icon, InputNumber, message, Modal } from 'antd';
import PropTypes from 'prop-types';
import { EDIT_CLIENT_SUBSCRIPTION } from './graphql/mutation';

const ClientSubscriptionForm = ({ form, client, updateFather, currentSubscription, close }) => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = e => {
    e.preventDefault();

    setLoading(true);
    form.validateFields(async (err, args) => {
      const margin = args.margin / 100;
      if (!err) {
        const { errors } = await client.mutate({
          mutation: EDIT_CLIENT_SUBSCRIPTION,
          variables: { clientSubscription: { ...args, margin, id: currentSubscription.id } }
        });

        if (!errors) {
          message.success('Se ha editado exitosamente la suscripción');
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

  return (
    <Modal
      title={`Editando seguimiento de cliente ${currentSubscription.client.businessName}`}
      visible
      cancelButtonProps={{ style: { display: 'none' } }}
      onCancel={close}
      onOk={close}
      width={650}
      footer={null}
    >
      <Form onSubmit={handleSubmit}>
        <Form.Item>
          <Divider style={{ marginTop: 0 }} orientation="left">
            Duración de los períodos en días
          </Divider>
          {form.getFieldDecorator('days', {
            initialValue: currentSubscription.days,
            rules: [
              {
                type: 'number',
                required: true,
                message: '¡La duración de los períodos es requerida!'
              }
            ]
          })(
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              step={1}
              placeholder="Ingrese los días"
              prefix={<Icon type="number" style={{ color: 'rgba(0,0,0,.25)' }} />}
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
            />
          )}
        </Form.Item>
        <Form.Item>
          <Divider style={{ marginTop: 0 }} orientation="left">
            Toneladas de consumo esperadas durante el período
          </Divider>
          {form.getFieldDecorator('tons', {
            initialValue: currentSubscription.tons,
            rules: [
              {
                type: 'number',
                required: true,
                message: '¡Toneladas de consumo mínimo son requeridas!'
              }
            ]
          })(
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              step={0.1}
              placeholder="Ingrese toneladas"
              prefix={<Icon type="number" style={{ color: 'rgba(0,0,0,.25)' }} />}
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
            />
          )}
        </Form.Item>
        <Form.Item>
          <Divider style={{ marginTop: 0 }} orientation="left">
            Margen de error máximo
          </Divider>
          {form.getFieldDecorator('margin', {
            initialValue: currentSubscription.margin * 100,
            rules: [
              {
                type: 'number',
                required: true,
                message: '¡Toneladas de consumo mínimo son requeridas!'
              }
            ]
          })(
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              max={100}
              step={0.1}
              formatter={value => (value.length > 0 ? `${value}%` : undefined)}
              parser={value => value.replace('%', '')}
            />
          )}
        </Form.Item>
        <Form.Item>
          <Divider style={{ marginTop: 0 }} orientation="left">
            Fecha de inicio
          </Divider>
          {form.getFieldDecorator('start', { initialValue: moment(currentSubscription.start) })(
            <DatePicker style={{ width: '50%' }} />
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

ClientSubscriptionForm.propTypes = {
  form: PropTypes.object.isRequired,
  client: PropTypes.object.isRequired,
  updateFather: PropTypes.func.isRequired,
  currentSubscription: PropTypes.object.isRequired,
  close: PropTypes.func.isRequired
};

export default withApollo(ClientSubscriptionForm);
