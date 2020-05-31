import React, { useEffect, useState } from 'react';
import { withApollo } from '@apollo/react-hoc';
import PropTypes from 'prop-types';
import { Divider, Form, Icon, Input, InputNumber, message, Modal, Radio, Select } from 'antd';
import { GET_GOAL_SUMMARY, GET_ROCKS } from './graphql/queries';
import { REGISTER_GOAL } from './graphql/mutations';

const { Option } = Select;

const NewGoal = ({ client, form, isModalOpen, goalsSummary, setIsModalOpen, setGoalsSummary }) => {
  const [loading, setLoading] = useState(false);
  const [rocks, setRocks] = useState([]);

  useEffect(() => {
    const getRocks = async () => {
      try {
        setLoading(true);
        const { data } = await client.query({
          query: GET_ROCKS,
          variables: { filters: {} }
        });

        setRocks(data.rocks);
        setLoading(false);
      } catch (e) {
        message.error('¡No se han podido cargar los productos correctamente!');
        setLoading(false);
      }
    };

    getRocks();
  }, [client]);

  const handleSubmit = e => {
    setLoading(true);
    e.preventDefault();
    form.validateFields(async (err, { name, selectedRocks, period, tons }) => {
      if (!err) {
        try {
          const {
            data: { goal }
          } = await client.mutate({
            mutation: REGISTER_GOAL,
            variables: {
              goal: { name, rocks: selectedRocks, period, tons }
            }
          });

          const { data } = await client.query({
            query: GET_GOAL_SUMMARY,
            variables: { id: goal.id }
          });

          const goalsSummaryToSet = [data.goalSummary, ...goalsSummary];
          setGoalsSummary(goalsSummaryToSet);
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
      visible={isModalOpen}
      onCancel={() => setIsModalOpen(false)}
      onOk={handleSubmit}
      cancelText="Cancelar"
      okText="Crear"
    >
      <Form>
        <Form.Item>
          <Divider orientation="left">Nombre de la meta</Divider>
          {form.getFieldDecorator('name', {
            rules: [
              {
                required: true,
                message: '¡Un nombre es requerido!'
              }
            ]
          })(
            <Input
              prefix={<Icon type="info" style={{ color: 'rgba(0,0,0,.25)' }} />}
              placeholder="Ingrese un nombre de referencia"
            />
          )}
        </Form.Item>
        <Form.Item>
          <Divider orientation="left">Productos incluídos en la meta</Divider>
          {form.getFieldDecorator('selectedRocks', {
            rules: [
              {
                required: true,
                message: '¡Una lista de productos es requerida!'
              }
            ]
          })(
            <Select
              loading={loading}
              mode="multiple"
              allowClear
              placeholder="Seleccione al menos 1 producto"
            >
              {rocks.map(({ id, name }) => (
                <Option key={id} value={id}>
                  {name}
                </Option>
              ))}
            </Select>
          )}
        </Form.Item>
        <Form.Item>
          <Divider style={{ marginTop: 0 }} orientation="left">
            Toneladas de consumo meta durante el período
          </Divider>
          {form.getFieldDecorator('tons', {
            rules: [
              {
                type: 'number',
                required: true,
                message: '¡Toneladas de consumo son requeridas!'
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
            Duración de los períodos
          </Divider>
          {form.getFieldDecorator('period', {
            rules: [
              {
                required: true,
                message: '¡La duración de los períodos es requerida!'
              }
            ]
          })(
            <Radio.Group>
              <Radio.Button value="DAY">Día</Radio.Button>
              <Radio.Button value="WEEK">Semana</Radio.Button>
              <Radio.Button value="MONTH">Mes</Radio.Button>
            </Radio.Group>
          )}
        </Form.Item>
      </Form>
    </Modal>
  );
};

NewGoal.propTypes = {
  client: PropTypes.object.isRequired,
  form: PropTypes.object.isRequired,
  isModalOpen: PropTypes.bool.isRequired,
  goalsSummary: PropTypes.array.isRequired,
  setIsModalOpen: PropTypes.func.isRequired,
  setGoalsSummary: PropTypes.func.isRequired
};

export default withApollo(NewGoal);
