import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Form, InputNumber, message, Modal, Select } from 'antd';
import { useMutation, useQuery } from '@apollo/react-hooks';
import { INIT_LAP } from './graphql/mutations';
import { GET_MACHINES } from './graphql/queries';

const { Option } = Select;

const LapFormInit = ({ showNewTripModal, setShowNewTripModal, setCurrentLap }) => {
  const [loading, setLoading] = useState(false);
  const [machineId, setMachineId] = useState(undefined);
  const [tons, setTons] = useState(25);
  const machinesQuery = useQuery(GET_MACHINES, { variables: { filters: {} } });
  const [tripInitMutation] = useMutation(INIT_LAP);

  const handleSubmit = async () => {
    setLoading(true);
    if (machineId && tons) {
      const { data, errors } = await tripInitMutation({
        variables: { lap: { machine: machineId, tons } }
      });

      if (errors) {
        errors.forEach(error => message.error(error.message));
        setLoading(false);
        return;
      }

      if (data.lapInit) {
        setCurrentLap(data.lapInit);
        setShowNewTripModal(false);
      }
    } else {
      message.error('Complete todos los campos!');
    }

    setLoading(false);
  };

  return (
    <Modal
      title="Iniciar vuelta"
      visible={showNewTripModal}
      confirmLoading={loading}
      onCancel={() => setShowNewTripModal(false)}
      onOk={handleSubmit}
      okText="Iniciar"
      cancelText="Cancelar"
    >
      <Form>
        <Form.Item>
          <Select
            placeholder="Seleccione una máquina"
            allowClear
            onChange={machineIdToSet => setMachineId(machineIdToSet)}
          >
            {machinesQuery.data?.machines.map(machine => (
              <Option key={machine.id} value={machine.id}>
                {machine.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item required label="Toneladas cargadas">
          <InputNumber
            style={{ width: '100%' }}
            placeholder="Ingrese las toneladas cargadas en la máquina"
            min={0.1}
            step={0.01}
            defaultValue={25}
            onChange={tonsToSet => setTons(tonsToSet)}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

LapFormInit.propTypes = {
  showNewTripModal: PropTypes.bool.isRequired,
  setShowNewTripModal: PropTypes.func.isRequired,
  setCurrentLap: PropTypes.func.isRequired
};

export default LapFormInit;