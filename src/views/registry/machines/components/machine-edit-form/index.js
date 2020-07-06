import React, { useState } from 'react';
import { withApollo } from 'react-apollo';
import PropTypes from 'prop-types';
import machineTypes from 'utils/enums/machines';
import { Button, Drawer, Form, Icon, Input, InputNumber, notification, Select } from 'antd';
import { EDIT_MACHINE } from './graphql/mutations';

const { Option } = Select;

const EditForm = ({ form, currentMachine, onMachineEdit, setCurrentMachine, client }) => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = e => {
    const { id } = currentMachine;

    setLoading(true);
    e.preventDefault();
    form.validateFields(
      async (
        err,
        { name, type, plates, brand, model, averageHorometer, standardHorometerDeviation }
      ) => {
        if (!err) {
          const {
            data: { machineEdit: machine }
          } = await client.mutate({
            mutation: EDIT_MACHINE,
            variables: {
              machine: {
                id,
                name,
                type,
                plates,
                brand,
                model,
                averageHorometer,
                standardHorometerDeviation
              }
            }
          });

          notification.open({
            message: `Máquina ${machine.name} ha sido editada exitosamente!`
          });

          onMachineEdit(machine);
          setCurrentMachine();
          form.resetFields();
        }

        setLoading(false);
      }
    );
  };

  return (
    <Drawer
      title={`Editando máquina: ${currentMachine.name}`}
      visible={currentMachine !== null}
      onClose={() => setCurrentMachine()}
      width={600}
    >
      <Form onSubmit={handleSubmit}>
        <Form.Item>
          {form.getFieldDecorator('name', {
            initialValue: currentMachine.name,
            rules: [
              {
                required: true,
                message: 'Un nombre de referencia es requerido!'
              }
            ]
          })(
            <Input
              prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }}/>}
              placeholder="Nombre de referencia"
            />
          )}
        </Form.Item>
        <Form.Item>
          {form.getFieldDecorator('type', {
            initialValue: currentMachine.type,
            rules: [
              {
                required: true,
                message: 'Un tipo de máquina es requerido!'
              }
            ]
          })(
            <Select placeholder="Tipo de máquina">
              {machineTypes.map(option => (
                <Option key={option} value={option}>
                  {`${option}`}
                </Option>
              ))}
            </Select>
          )}
        </Form.Item>
        <Form.Item>
          {form.getFieldDecorator('plates', {
            initialValue: currentMachine.plates,
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
            initialValue: currentMachine.brand,
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
            initialValue: currentMachine.model,
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
          {form.getFieldDecorator('averageHorometer', {
            initialValue: currentMachine.averageHorometer,
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
            initialValue: currentMachine.standardHorometerDeviation,
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

EditForm.propTypes = {
  client: PropTypes.object.isRequired,
  form: PropTypes.object.isRequired,
  currentMachine: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    plates: PropTypes.string.isRequired,
    brand: PropTypes.string.isRequired,
    model: PropTypes.string.isRequired,
    averageHorometer: PropTypes.number.isRequired,
    standardHorometerDeviation: PropTypes.number.isRequired
  }).isRequired,
  onMachineEdit: PropTypes.func.isRequired,
  setCurrentMachine: PropTypes.func.isRequired
};

export default withApollo(EditForm);
