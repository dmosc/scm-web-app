import React, { useState } from 'react';
import { withApollo } from 'react-apollo';
import { Button, Drawer, Form, Icon, Input, InputNumber, notification, Select } from 'antd';
import PropTypes from 'prop-types';
import { REGISTER_MACHINE } from './graphql/mutations';

const NewForm = ({ client, form, visible, toggleNewMachineModal, machines, setMachines }) => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = e => {
    setLoading(true);
    e.preventDefault();
    form.validateFields(
      async (
        err,
        { name, plates, brand, model, drivers, averageHorometer, standardHorometerDeviation }
      ) => {
        if (!err) {
          const {
            data: { machine }
          } = await client.mutate({
            mutation: REGISTER_MACHINE,
            variables: {
              machine: {
                name,
                plates,
                brand,
                model,
                drivers,
                averageHorometer,
                standardHorometerDeviation
              }
            }
          });

          const machinesToSet = [machine, ...machines];
          setLoading(false);
          setMachines(machinesToSet);
          toggleNewMachineModal(false);

          notification.open({
            message: `Máquina ${machine.name} ha sido registrada exitosamente!`
          });

          form.resetFields();
        } else {
          setLoading(false);
        }
      }
    );
  };

  return (
    <Drawer
      title="Añade una nueva máquina"
      visible={visible}
      onClose={() => toggleNewMachineModal(false)}
      width={600}
    >
      <Form onSubmit={handleSubmit}>
        <Form.Item>
          {form.getFieldDecorator('name', {
            rules: [
              {
                required: true,
                message: 'Un nombre de referencia es requerido!'
              }
            ]
          })(
            <Input
              prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
              placeholder="Nombre de referencia"
            />
          )}
        </Form.Item>
        <Form.Item>
          {form.getFieldDecorator('plates', {
            rules: [
              {
                required: true,
                message: 'Las placas del camión son requeridas!'
              }
            ]
          })(
            <Input
              prefix={<Icon type="number" style={{ color: 'rgba(0,0,0,.25)' }} />}
              placeholder="Placas"
            />
          )}
        </Form.Item>
        <Form.Item>
          {form.getFieldDecorator('brand', {
            rules: [
              {
                required: true,
                message: 'La marca del camión es requerida!'
              }
            ]
          })(
            <Input
              prefix={<Icon type="car" style={{ color: 'rgba(0,0,0,.25)' }} />}
              placeholder="Marca"
            />
          )}
        </Form.Item>
        <Form.Item>
          {form.getFieldDecorator('model', {
            rules: [
              {
                required: true,
                message: 'El modelo es requerido!'
              }
            ]
          })(
            <Input
              prefix={<Icon type="unordered-list" style={{ color: 'rgba(0,0,0,.25)' }} />}
              placeholder="Modelo"
            />
          )}
        </Form.Item>
        <Form.Item>
          {form.getFieldDecorator('drivers', {
            rules: [
              {
                required: true,
                message: 'Ingrese 1 o más nombres de conductores'
              }
            ]
          })(
            <Select
              placeholder="Conductor(es) del camión"
              mode="tags"
              maxTagCount={1}
              tokenSeparators={[',']}
            />
          )}
        </Form.Item>
        <Form.Item>
          {form.getFieldDecorator('averageHorometer', {
            rules: [
              {
                required: true,
                message: 'El horómetro promedio es requerido!'
              }
            ]
          })(
            <InputNumber
              style={{ width: '100%' }}
              placeholder="Horómetro promedio"
              min={0}
              step={0.1}
            />
          )}
        </Form.Item>
        <Form.Item>
          {form.getFieldDecorator('standardHorometerDeviation', {
            rules: [
              {
                required: true,
                message: 'La desviación estándar del horómetro es requerida!'
              }
            ]
          })(
            <InputNumber
              style={{ width: '100%' }}
              placeholder="Desviación estándar del horómetro"
              min={0}
              step={0.1}
            />
          )}
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" icon="save" loading={loading}>
            {(loading && 'Espere...') || 'Guardar'}
          </Button>
        </Form.Item>
      </Form>
    </Drawer>
  );
};

NewForm.propTypes = {
  client: PropTypes.object.isRequired,
  form: PropTypes.object.isRequired,
  visible: PropTypes.bool.isRequired,
  toggleNewMachineModal: PropTypes.func.isRequired,
  machines: PropTypes.arrayOf(PropTypes.object).isRequired,
  setMachines: PropTypes.func.isRequired
};

export default withApollo(NewForm);
