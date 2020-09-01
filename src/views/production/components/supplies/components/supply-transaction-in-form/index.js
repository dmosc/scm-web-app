import React, { useEffect, useState } from 'react';
import { useDebounce } from 'use-lodash-debounce';
import PropTypes from 'prop-types';
import {
  Checkbox,
  DatePicker,
  Divider,
  Form,
  Icon,
  Input,
  InputNumber,
  message,
  Modal,
  Select
} from 'antd';
import { useMutation, useQuery } from '@apollo/react-hooks';
import { NEW_SUPPLY_TRANSACTION_IN } from './graphql/mutations';
import { GET_SUPPLIES } from './graphql/queries';

const { Option } = Select;
const { TextArea } = Input;

const SupplyTransactionInForm = ({
  form,
  supplyTransactionsIn,
  isTransactionModalOpen,
  toggleTransactionModal,
  setSupplyTransactionsIn,
  updateFather
}) => {
  const [loading, setLoading] = useState(false);
  const [loadingSupplies, setLoadingSupplies] = useState(false);
  const [supplies, setSupplies] = useState([]);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);
  const [newSupplyTransactionMutation] = useMutation(NEW_SUPPLY_TRANSACTION_IN);
  const suppliesQuery = useQuery(GET_SUPPLIES, {
    variables: { filters: { search: debouncedSearch } }
  });

  useEffect(() => {
    const { data } = suppliesQuery;
    if (data?.supplies) {
      setSupplies(data?.supplies);
      setLoadingSupplies(false);
    }
  }, [suppliesQuery, debouncedSearch]);

  const handleSubmit = e => {
    setLoading(true);
    e.preventDefault();
    form.validateFields(async (err, args) => {
      if (!err) {
        let supplyToSet;
        let errorsToSet;

        const {
          errors,
          data: { supplyTransactionIn }
        } = await newSupplyTransactionMutation({
          variables: { supplyTransactionIn: { ...args, supply: args.supply.split(':')[0] } }
        });

        if (errors) {
          errorsToSet = { ...errors };
        } else {
          supplyToSet = { ...supplyTransactionIn };
          const supplyTransactionsInToSet = [supplyToSet, ...supplyTransactionsIn];
          setSupplyTransactionsIn(supplyTransactionsInToSet);
          updateFather();
        }

        if (errorsToSet) {
          errorsToSet.forEach(error => message.error(error.message));
          setLoading(false);
          return;
        }

        toggleTransactionModal(false);

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
      title="Registrar nueva entrada"
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
              loading={loadingSupplies}
              onSearch={searchToSet => setSearch(searchToSet)}
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
        <Form.Item style={{ marginBottom: 0 }}>
          {form.getFieldDecorator('isAdjustment', { initialValue: false })(
            <Form.Item style={{ marginTop: 10 }}>
              <Checkbox defaultChecked={false} style={{ fontWeight: 'bold' }}>
                CONSIDERAR COMO AJUSTE
              </Checkbox>
            </Form.Item>
          )}
        </Form.Item>
      </Form>
    </Modal>
  );
};

SupplyTransactionInForm.propTypes = {
  form: PropTypes.object.isRequired,
  supplyTransactionsIn: PropTypes.array.isRequired,
  isTransactionModalOpen: PropTypes.bool.isRequired,
  toggleTransactionModal: PropTypes.func.isRequired,
  setSupplyTransactionsIn: PropTypes.func.isRequired,
  updateFather: PropTypes.func.isRequired
};

export default SupplyTransactionInForm;
