import React, { useEffect, useState } from 'react';
import { withApollo } from '@apollo/react-hoc';
import PropTypes from 'prop-types';
import debounce from 'debounce';
import { Form, Icon, InputNumber, message, Modal, notification, Select } from 'antd';
import { GET_MACHINES } from './graphql/queries';
import { REGISTER_MACHINE_DIESEL_LOAD } from './graphql/mutations';

const { Option } = Select;

const MachineDieselLoadForm = ({
  isModalOpen,
  setIsModalOpen,
  latestMachineDieselLoad,
  machineDieselLoads,
  setMachineDieselLoads,
  form,
  client
}) => {
  const [loading, setLoading] = useState(false);
  const [loadingMachines, setLoadingMachines] = useState(false);
  const [search, setSearch] = useState('');
  const [machines, setMachines] = useState([]);
  const [currentMachine, setCurrentMachine] = useState(null);

  useEffect(() => {
    const getMachines = debounce(async () => {
      if (!search) {
        setMachines([]);
        setLoadingMachines(false);
        return;
      }

      setLoadingMachines(true);

      try {
        const {
          data: { machines: machinesToSet }
        } = await client.query({
          query: GET_MACHINES,
          variables: {
            filters: { limit: 10, search }
          }
        });

        setLoadingMachines(true);
        setMachines(machinesToSet);
      } catch (e) {
        notification.open({ message: e });
      }
    }, 1500);

    getMachines();
  }, [client, search]);

  const onSearch = searchToSet => {
    setLoadingMachines(!!searchToSet);
    setSearch(searchToSet);
  };

  const handleMachineSelect = machineId => {
    // eslint-disable-next-line no-unused-vars
    const [_, id] = machineId.split(':');
    const currentMachineToSet = machines.filter(machine => machine.id === id)[0];
    setCurrentMachine(currentMachineToSet);
  };

  const handleSubmit = e => {
    setLoading(true);
    e.preventDefault();
    form.validateFields(
      async (err, { driver, previousTankIndicator, tankIndicator, horometer }) => {
        if (!err) {
          try {
            const {
              data: { machineDieselLoad }
            } = await client.mutate({
              mutation: REGISTER_MACHINE_DIESEL_LOAD,
              variables: {
                machineDieselLoad: {
                  machine: currentMachine.id,
                  driver,
                  previousTankIndicator,
                  tankIndicator,
                  horometer
                }
              }
            });

            const machineDieselLoadsToSet = [machineDieselLoad, ...machineDieselLoads];

            setMachineDieselLoads(machineDieselLoadsToSet);
            setIsModalOpen(false);

            message.success('Se ha realizado el registro exitosamente!');
            form.resetFields();
          } catch {
            message.error('Ha habido un error realizando el registro!');
          }
        }

        setLoading(false);
      }
    );
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
        <Form.Item>
          {form.getFieldDecorator('machine', {
            rules: [
              {
                required: true,
                message: 'Seleccione una máquina!'
              }
            ]
          })(
            <Select
              allowClear
              showSearch
              style={{ width: '100%' }}
              placeholder="Máquina"
              onSearch={onSearch}
              onSelect={machineId => handleMachineSelect(machineId)}
              loading={loadingMachines}
            >
              {machines.map(({ id, name }) => (
                <Option key={id} value={`${name}:${id}`}>
                  <span>{name}</span>
                </Option>
              ))}
            </Select>
          )}
        </Form.Item>
        <Form.Item>
          {form.getFieldDecorator('driver', {
            rules: [
              {
                required: true,
                message: 'Nombre(s) del conductor son requeridos!'
              }
            ]
          })(
            <Select allowClear showSearch placeholder="Nombre(s) y apellidos del conductor">
              {currentMachine?.drivers.map(driver => (
                <Option key={driver} value={driver}>
                  {driver}
                </Option>
              ))}
            </Select>
          )}
        </Form.Item>
        <Form.Item label="Indicador anterior">
          {form.getFieldDecorator('previousTankIndicator', {
            initialValue: latestMachineDieselLoad?.tankIndicator || 0,
            rules: [
              {
                required: true,
                message: 'El registro del indicador anterior es requerido!'
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
        <Form.Item label="Indicador actual">
          {form.getFieldDecorator('tankIndicator', {
            initialValue: latestMachineDieselLoad?.tankIndicator || 0,
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
        <Form.Item label="Horómetro actual">
          {form.getFieldDecorator('horometer', {
            initialValue: 0,
            rules: [
              {
                required: true,
                message: 'El horómetro de la máquina siendo cargada es requerido!'
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
      </Form>
    </Modal>
  );
};

MachineDieselLoadForm.propTypes = {
  isModalOpen: PropTypes.bool.isRequired,
  setIsModalOpen: PropTypes.func.isRequired,
  latestMachineDieselLoad: PropTypes.object.isRequired,
  machineDieselLoads: PropTypes.array.isRequired,
  setMachineDieselLoads: PropTypes.func.isRequired,
  form: PropTypes.object.isRequired,
  client: PropTypes.object.isRequired
};

export default withApollo(MachineDieselLoadForm);
