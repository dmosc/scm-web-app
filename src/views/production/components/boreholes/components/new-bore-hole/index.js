import React, { useState } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { DatePicker, Divider, Form, Icon, InputNumber, message, Modal, Select } from 'antd';
import { useMutation, useQuery } from '@apollo/react-hooks';
import { EDIT_BORE_HOLE, NEW_BORE_HOLE } from './graphql/mutations';
import { GET_MACHINES } from './graphql/queries';

const { Option } = Select;

const NewBoreHole = ({
  form,
  boreHoles,
  currentBoreHole,
  isNewBoreHoleModalOpen,
  toggleNewBoreHoleModal,
  setBoreHoles,
  setCurrentBoreHole
}) => {
  const [loading, setLoading] = useState(false);
  const machinesQuery = useQuery(GET_MACHINES, { variables: { filters: {} } });
  const [newBoreHoleMutation] = useMutation(NEW_BORE_HOLE);
  const [boreHoleEditMutation] = useMutation(EDIT_BORE_HOLE);

  const handleSubmit = e => {
    setLoading(true);
    e.preventDefault();
    form.validateFields(async (err, args) => {
      if (!err) {
        let boreHoleToSet;
        let errorsToSet;
        if (currentBoreHole) {
          const {
            errors,
            data: { boreHoleEdit }
          } = await boreHoleEditMutation({
            variables: { boreHole: { id: currentBoreHole.id, ...args } }
          });

          if (errors) {
            errorsToSet = { ...errors };
          } else {
            boreHoleToSet = { ...boreHoleEdit };
            const boreHolesToSet = boreHoles.map(boreHole =>
              boreHole.id === currentBoreHole.id ? boreHoleToSet : boreHole
            );
            setBoreHoles(boreHolesToSet);
          }
        } else {
          const {
            errors,
            data: { boreHole }
          } = await newBoreHoleMutation({ variables: { boreHole: { ...args } } });

          if (errors) {
            errorsToSet = { ...errors };
          } else {
            boreHoleToSet = { ...boreHole };
            const boreHolesToSet = [boreHoleToSet, ...boreHoles];
            setBoreHoles(boreHolesToSet);
          }
        }

        if (errorsToSet) {
          errorsToSet.forEach(error => message.error(error.message));
          setLoading(false);
          return;
        }

        toggleNewBoreHoleModal(false);
        setCurrentBoreHole(undefined);

        message.success(`La barrenación ${boreHoleToSet.folio} ha sido registrada exitosamente`);
      } else {
        message.error('Ha habido un error registrando la barrenación!');
        setLoading(false);
      }
    });
  };

  return (
    <Modal
      cancelText="Cancelar"
      okText="Registrar"
      confirmLoading={loading}
      visible={isNewBoreHoleModalOpen || currentBoreHole !== undefined}
      onCancel={() => {
        toggleNewBoreHoleModal(false);
        setCurrentBoreHole(undefined);
      }}
      onOk={handleSubmit}
    >
      <Form>
        <Form.Item>
          <Divider style={{ marginTop: 0 }} orientation="left">
            Metros de cobertura
          </Divider>
          {form.getFieldDecorator('meters', {
            initialValue: currentBoreHole?.meters,
            rules: [
              {
                type: 'number',
                required: true,
                message: '¡Los metros son requeridos!'
              }
            ]
          })(
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              step={0.1}
              placeholder="Ingrese metros de cobertura"
              prefix={<Icon type="number" style={{ color: 'rgba(0,0,0,.25)' }} />}
            />
          )}
        </Form.Item>
        <Form.Item style={{ marginBottom: 0 }}>
          <Divider orientation="left">Fecha de ejecución</Divider>
          {form.getFieldDecorator('date', {
            initialValue: moment(currentBoreHole?.date),
            rules: [
              {
                required: true,
                message: 'La fecha de ejecución es requerida!'
              }
            ]
          })(<DatePicker />)}
        </Form.Item>
        <Form.Item>
          <Divider orientation="left">Máquina de operación</Divider>
          {form.getFieldDecorator('machine', {
            initialValue: currentBoreHole?.machine.id,
            rules: [
              {
                required: true,
                message: 'La máquina de operación es requerida!'
              }
            ]
          })(
            <Select placeholder="Seleccione una máquina" allowClear>
              {machinesQuery.data?.machines.map(machine => (
                <Option key={machine.id} value={machine.id}>
                  {machine.name}
                </Option>
              ))}
            </Select>
          )}
        </Form.Item>
      </Form>
    </Modal>
  );
};

NewBoreHole.defaultProps = {
  currentBoreHole: undefined
};

NewBoreHole.propTypes = {
  form: PropTypes.object.isRequired,
  boreHoles: PropTypes.array.isRequired,
  currentBoreHole: PropTypes.object,
  isNewBoreHoleModalOpen: PropTypes.bool.isRequired,
  toggleNewBoreHoleModal: PropTypes.func.isRequired,
  setBoreHoles: PropTypes.func.isRequired,
  setCurrentBoreHole: PropTypes.func.isRequired
};

export default NewBoreHole;
