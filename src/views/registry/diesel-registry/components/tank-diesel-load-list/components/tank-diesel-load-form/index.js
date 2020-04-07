import React, { useState } from 'react';
import { withApollo } from '@apollo/react-hoc';
import PropTypes from 'prop-types';
import { Form, Icon, Input, InputNumber, message, Modal } from 'antd';
import { REGISTER_TANK_DIESEL_LOAD } from './graphql/mutations';

const TankDieselLoadForm = ({
  isModalOpen,
  setIsModalOpen,
  tankDieselLoads,
  setTankDieselLoads,
  form,
  client
}) => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = e => {
    setLoading(true);
    e.preventDefault();
    form.validateFields(async (err, { tankIndicator, load, reference, comments }) => {
      if (!err) {
        try {
          const {
            data: { tankDieselLoad }
          } = await client.mutate({
            mutation: REGISTER_TANK_DIESEL_LOAD,
            variables: {
              tankDieselLoad: { tankIndicator, load, reference, comments }
            }
          });

          const tankDieselLoadsToSet = [tankDieselLoad, ...tankDieselLoads];
          setTankDieselLoads(tankDieselLoadsToSet);
          setIsModalOpen(false);

          message.success('Se ha realizado el registro exitosamente!');
          form.resetFields();
        } catch {
          message.error('Ha habido un error realizando el registro!');
        }
      }

      setLoading(false);
    });
  };

  return (
    <Modal
      title="Registrar salida de diésel"
      visible={isModalOpen}
      onOk={handleSubmit}
      confirmLoading={loading}
      onCancel={() => setIsModalOpen(false)}
    >
      <Form>
        <Form.Item label="Indicador actual">
          {form.getFieldDecorator('tankIndicator', {
            initialValue: 0,
            rules: [
              {
                required: true,
                message: 'El registro del indicador actual es requerido!'
              }
            ]
          })(
            <InputNumber
              style={{ width: '50%' }}
              min={0}
              prefix={<Icon type="number" style={{ color: 'rgba(0,0,0,.25)' }} />}
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
            />
          )}
        </Form.Item>
        <Form.Item label="Carga total">
          {form.getFieldDecorator('load', {
            initialValue: 0,
            rules: [
              {
                required: true,
                message: 'La carga total es requerida!'
              }
            ]
          })(
            <InputNumber
              style={{ width: '50%' }}
              min={0}
              prefix={<Icon type="number" style={{ color: 'rgba(0,0,0,.25)' }} />}
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
            />
          )}
        </Form.Item>
        <Form.Item>
          {form.getFieldDecorator('reference', {
            rules: [
              {
                required: true,
                message: 'Una referencia es requerida!'
              }
            ]
          })(
            <Input
              prefix={<Icon type="info" style={{ color: 'rgba(0,0,0,.25)' }} />}
              placeholder="Referencia"
            />
          )}
        </Form.Item>
        <Form.Item>
          {form.getFieldDecorator('comments', {
            rules: [
              {
                required: true,
                message: 'Algún comentario es requerido!'
              }
            ]
          })(
            <Input
              prefix={<Icon type="info" style={{ color: 'rgba(0,0,0,.25)' }} />}
              placeholder="Comentarios"
            />
          )}
        </Form.Item>
      </Form>
    </Modal>
  );
};

TankDieselLoadForm.propTypes = {
  isModalOpen: PropTypes.bool.isRequired,
  setIsModalOpen: PropTypes.func.isRequired,
  tankDieselLoads: PropTypes.array.isRequired,
  setTankDieselLoads: PropTypes.func.isRequired,
  form: PropTypes.object.isRequired,
  client: PropTypes.object.isRequired
};

export default withApollo(TankDieselLoadForm);
