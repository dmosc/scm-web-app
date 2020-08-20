import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDebounce } from 'use-lodash-debounce';
import { DatePicker, Divider, Form, Icon, Input, InputNumber, message, Modal, Select } from 'antd';
import { useMutation, useQuery } from '@apollo/react-hooks';
import { NEW_SUPPLY_TRANSACTION_IN } from './graphql/mutations';
import { GET_MACHINES, GET_SUPPLIES } from './graphql/queries';

const { Option } = Select;
const { TextArea } = Input;

const SupplyTransactionOutForm = ({
  form,
  supplyTransactionsOut,
  isTransactionModalOpen,
  toggleTransactionModal,
  setSupplyTransactionsOut,
  updateFather
}) => {
  const [loading, setLoading] = useState(false);
  const [machineSearch, setMachineSearch] = useState('');
  const [supplySearch, setSupplySearch] = useState('');
  const [machines, setMachines] = useState([]);
  const [supplies, setSupplies] = useState([]);
  const debouncedMachineSearch = useDebounce(machineSearch, 400);
  const debouncedSupplySearch = useDebounce(supplySearch, 400);
  const [newSupplyTransactionMutation] = useMutation(NEW_SUPPLY_TRANSACTION_IN);
  const machinesQuery = useQuery(GET_MACHINES, {
    variables: { filters: { search: debouncedMachineSearch } }
  });
  const suppliesQuery = useQuery(GET_SUPPLIES, {
    variables: { filters: { search: debouncedSupplySearch } }
  });

  useEffect(() => {
    const { data } = machinesQuery;
    if (data?.machines) {
      setMachines(data?.machines);
    }
  }, [machinesQuery, debouncedMachineSearch]);

  useEffect(() => {
    const { data } = suppliesQuery;
    if (data?.supplies) {
      setSupplies(data?.supplies);
    }
  }, [suppliesQuery, debouncedSupplySearch]);

  const handleSubmit = e => {
    setLoading(true);
    e.preventDefault();
    form.validateFields(async (err, args) => {
      if (!err) {
        const { errors, data } = await newSupplyTransactionMutation({
          variables: {
            supplyTransactionOut: {
              ...args,
              supply: args.supply.split(':')[0],
              machine: args.machine.split(':')[0]
            }
          }
        });

        if (errors) {
          errors.forEach(error => message.error(error.message));
          setLoading(false);
          return;
        }

        const supplyToSet = { ...data?.supplyTransactionOut };
        const supplyTransactionsOutToSet = [supplyToSet, ...supplyTransactionsOut];

        setSupplyTransactionsOut(supplyTransactionsOutToSet);
        toggleTransactionModal(false);
        updateFather();

        message.success('La transacción ha sido registrada exitosamente');
      } else {
        message.error('Ha habido un error registrando la transacción!');
        setLoading(false);
      }
    });
  };

  return (
    <Modal
      cancelText="Cancelar"
      okText="Registrar"
      title="Registrar nueva salida"
      confirmLoading={loading}
      visible={isTransactionModalOpen}
      onCancel={() => {
        toggleTransactionModal(false);
      }}
      onOk={handleSubmit}
    >
      <Form>
        <Form.Item>
          <Divider style={{ marginTop: 0 }} orientation="left">
            Seleccione un suministro
          </Divider>
          {form.getFieldDecorator('supply')(
            <Select
              showSearch
              allowClear
              style={{ width: '100%', overflowY: 'scroll' }}
              placeholder="Buscar suministros por nombre"
              onSearch={searchToSet => setSupplySearch(searchToSet)}
            >
              {supplies.map(({ id, name }) => (
                <Option key={id} value={`${id}:${name}`}>
                  {name}
                </Option>
              ))}
            </Select>
          )}
        </Form.Item>
        <Form.Item>
          <Divider style={{ marginTop: 0 }} orientation="left">
            Seleccione una máquina
          </Divider>
          {form.getFieldDecorator('machine')(
            <Select
              showSearch
              allowClear
              style={{ width: '100%', overflowY: 'scroll' }}
              placeholder="Buscar suministros por nombre"
              onSearch={searchToSet => setMachineSearch(searchToSet)}
            >
              {machines.map(({ id, name }) => (
                <Option key={id} value={`${id}:${name}`}>
                  {name}
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
              min={0}
              step={0.1}
              placeholder="Ingrese la cantidad inicial de unidades"
              prefix={<Icon type="number" style={{ color: 'rgba(0,0,0,.25)' }} />}
            />
          )}
        </Form.Item>
        <Form.Item>
          <Divider orientation="left">Fecha de ejecución</Divider>
          {form.getFieldDecorator('date', {
            rules: [
              {
                required: true,
                message: 'La fecha de ejecución es requerida!'
              }
            ]
          })(<DatePicker />)}
        </Form.Item>
        <Form.Item>
          <Divider style={{ marginTop: 0 }} orientation="left">
            Observaciones
          </Divider>
          {form.getFieldDecorator('comment', {
            rules: [
              {
                required: true,
                message: 'Una descripción es necesaria!'
              }
            ]
          })(
            <TextArea
              style={{ padding: '10px 15px' }}
              placeholder="Descripción"
              autoSize={{ minRows: 2, maxRows: 4 }}
            />
          )}
        </Form.Item>
      </Form>
    </Modal>
  );
};

SupplyTransactionOutForm.propTypes = {
  form: PropTypes.object.isRequired,
  supplyTransactionsOut: PropTypes.array.isRequired,
  isTransactionModalOpen: PropTypes.bool.isRequired,
  toggleTransactionModal: PropTypes.func.isRequired,
  setSupplyTransactionsOut: PropTypes.func.isRequired,
  updateFather: PropTypes.func.isRequired
};

export default SupplyTransactionOutForm;
