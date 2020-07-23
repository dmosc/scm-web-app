import React, { useState } from 'react';
import PropTypes from 'prop-types';
import supplyTypes from 'utils/enums/supplyTypes';
import units from 'utils/enums/units';
import { Divider, Form, Icon, Input, InputNumber, message, Modal, Select } from 'antd';
import { useMutation } from '@apollo/react-hooks';
import { EDIT_SUPPLY, NEW_SUPPLY } from './graphql/mutations';

const { Option } = Select;

const SupplyForm = ({ form, supplies, currentSupply, isSupplyFormModalOpen, toggleSupplyFormModal, setSupplies, setCurrentSupply }) => {
  const [loading, setLoading] = useState(false);
  const [newSupplyMutation] = useMutation(NEW_SUPPLY);
  const [supplyEditMutation] = useMutation(EDIT_SUPPLY);

  const handleSubmit = e => {
    setLoading(true);
    e.preventDefault();
    form.validateFields(async (err, args) => {
      if (!err) {
        let supplyToSet;
        let errorsToSet;
        if (currentSupply) {
          const {
            errors,
            data: { supplyEdit }
          } = await supplyEditMutation({ variables: { supply: { id: currentSupply.id, ...args } } });

          if (errors) {
            errorsToSet = { ...errors };
          } else {
            supplyToSet = { ...supplyEdit };
            const suppliesToSet = supplies
              .map(supply => supply.id === currentSupply.id ? supplyToSet : supply);
            setSupplies(suppliesToSet);
          }
        } else {
          const {
            errors,
            data: { supply }
          } = await newSupplyMutation({ variables: { supply: { ...args } } });

          if (errors) {
            errorsToSet = { ...errors };
          } else {
            supplyToSet = { ...supply };
            const suppliesToSet = [supplyToSet, ...supplies];
            setSupplies(suppliesToSet);
          }
        }

        if (errorsToSet) {
          errorsToSet.forEach(error => message.error(error.message));
          setLoading(false);
          return;
        }

        toggleSupplyFormModal(false);
        setCurrentSupply(undefined);

        message.success(`El suministro ${supplyToSet.name} ha sido registrado exitosamente`);
      } else {
        message.error('Ha habido un error registrando el suministro!');
        setLoading(false);
      }
    });
  };

  return (
    <Modal
      cancelText="Cancelar"
      okText={currentSupply ? 'Guardar' : 'Registrar'}
      title={currentSupply ? `Editando ${currentSupply?.name}` : 'Registrar nuevo suministro'}
      confirmLoading={loading}
      visible={isSupplyFormModalOpen || currentSupply !== undefined}
      onCancel={() => {
        toggleSupplyFormModal(false);
        setCurrentSupply(undefined);
      }}
      onOk={handleSubmit}
    >
      <Form>
        <Form.Item>
          <Divider style={{ marginTop: 0 }} orientation="left">
            Nombre de referencia
          </Divider>
          {form.getFieldDecorator('name', {
            initialValue: currentSupply?.name,
            rules: [
              {
                required: true,
                message: 'Un nombre de referencia es requerido!'
              }
            ]
          })(
            <Input
              prefix={<Icon type="info" style={{ color: 'rgba(0,0,0,.25)' }}/>}
              placeholder="Nombre de referencia"
            />
          )}
        </Form.Item>
        <Form.Item>
          <Divider orientation="left">Tipo de suministro</Divider>
          {form.getFieldDecorator('type', {
            initialValue: currentSupply?.type,
            rules: [
              {
                required: true,
                message: '¡El tipo de suministro es requerido!'
              }
            ]
          })(
            <Select
              disabled={currentSupply !== undefined}
              loading={loading}
              allowClear
              placeholder="Seleccione el tipo de suministro"
            >
              {supplyTypes.map(({ name, value }) => (
                <Option key={value} value={value}>
                  {name}
                </Option>
              ))}
            </Select>
          )}
        </Form.Item>
        <Form.Item>
          <Divider orientation="left">Unidad</Divider>
          {form.getFieldDecorator('unit', {
            initialValue: currentSupply?.unit,
            rules: [
              {
                required: true,
                message: '¡Una unidad de medida es requerida!'
              }
            ]
          })(
            <Select
              disabled={currentSupply !== undefined}
              loading={loading}
              allowClear
              placeholder="Unidad de medida"
            >
              {units.map(unit => (
                <Option key={unit} value={unit}>
                  {unit}
                </Option>
              ))}
            </Select>
          )}
        </Form.Item>
        <Form.Item>
          <Divider style={{ marginTop: 0 }} orientation="left">
            Cantidad
          </Divider>
          {form.getFieldDecorator('quantity', {
            initialValue: currentSupply?.quantity,
            rules: [
              {
                type: 'number',
                required: true,
                message: '¡Una cantidad inicial es requerida!'
              }
            ]
          })(
            <InputNumber
              style={{ width: '100%' }}
              disabled={currentSupply !== undefined}
              min={0}
              step={0.1}
              placeholder="Ingrese la cantidad inicial de unidades"
              prefix={<Icon type="number" style={{ color: 'rgba(0,0,0,.25)' }}/>}
            />
          )}
        </Form.Item>
      </Form>
    </Modal>
  );
};

SupplyForm.defaultProps = {
  currentSupply: undefined
};

SupplyForm.propTypes = {
  form: PropTypes.object.isRequired,
  supplies: PropTypes.array.isRequired,
  currentSupply: PropTypes.object,
  isSupplyFormModalOpen: PropTypes.bool.isRequired,
  toggleSupplyFormModal: PropTypes.func.isRequired,
  setSupplies: PropTypes.func.isRequired,
  setCurrentSupply: PropTypes.func.isRequired
};

export default SupplyForm;