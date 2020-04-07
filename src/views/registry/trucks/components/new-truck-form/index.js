import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import debounce from 'debounce';
import { withApollo } from 'react-apollo';
import { Button, Drawer, Form, Icon, Input, InputNumber, notification, Select } from 'antd';
import { REGISTER_TRUCK } from './graphql/mutations';
import { GET_CLIENTS } from './graphql/queries';

const { Option } = Select;

const NewTruckForm = ({ form, visible, toggleNewTruckModal, client, trucks, setTrucks }) => {
  const [loadingClients, setLoadingClients] = useState(false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [clients, setClients] = useState([]);

  useEffect(() => {
    const getClients = debounce(async () => {
      if (!search) {
        setClients([]);
        setLoadingClients(false);
        return;
      }

      setLoadingClients(true);

      try {
        const {
          data: { clients: clientsToSet }
        } = await client.query({
          query: GET_CLIENTS,
          variables: {
            filters: { limit: 10, search }
          }
        });

        setLoadingClients(true);
        setClients(clientsToSet);
      } catch (e) {
        notification.open({ message: e });
      }
    }, 1500);

    getClients();
  }, [client, search]);

  const onSearch = searchToSet => {
    setLoadingClients(!!searchToSet);
    setSearch(searchToSet);
  };

  const handleSubmit = e => {
    e.preventDefault();
    setLoading(true);

    form.validateFields(async (err, { plates, brand, model, weight, client: cli, drivers }) => {
      if (!err) {
        const { data, errors } = await client.mutate({
          mutation: REGISTER_TRUCK,
          variables: {
            truck: {
              plates,
              brand,
              model,
              weight,
              client: cli.substring(cli.indexOf(':') + 1),
              drivers
            }
          }
        });

        if (errors) {
          notification.open({
            message: errors[0].message
          });
          setLoading(false);
          return;
        }

        const trucksToSet = [data.truck, ...trucks];
        setTrucks(trucksToSet);
        setLoading(false);

        notification.open({
          message: `Camión ${data.truck.plates} ha sido registrado exitosamente!`
        });

        form.resetFields();
        toggleNewTruckModal(false);
      } else {
        setLoading(false);
      }
    });
  };

  return (
    <Drawer
      title="Añade un nuevo camión"
      visible={visible}
      onClose={() => toggleNewTruckModal(false)}
      width={600}
    >
      <Form onSubmit={handleSubmit}>
        <Form.Item>
          {form.getFieldDecorator('client')(
            <Select
              showSearch
              allowClear
              style={{ width: '100%' }}
              placeholder="Cliente"
              onSearch={onSearch}
              loading={loadingClients}
            >
              {clients.map(({ id, businessName }) => (
                <Option key={id} value={`${businessName}:${id}`}>
                  <span>{`${businessName}`}</span>
                </Option>
              ))}
            </Select>
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
          {form.getFieldDecorator('weight', {
            rules: [
              {
                required: true,
                message: 'El peso del camión en KG es requerido!'
              }
            ]
          })(
            <InputNumber
              style={{ width: '100%' }}
              placeholder="Peso neto en KG"
              min={0}
              step={0.1}
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
          <Button type="primary" htmlType="submit" icon="save" loading={loading}>
            {(loading && 'Espere...') || 'Guardar'}
          </Button>
        </Form.Item>
      </Form>
    </Drawer>
  );
};

NewTruckForm.propTypes = {
  client: PropTypes.object.isRequired,
  form: PropTypes.object.isRequired,
  visible: PropTypes.bool.isRequired,
  toggleNewTruckModal: PropTypes.func.isRequired,
  trucks: PropTypes.arrayOf(PropTypes.object).isRequired,
  setTrucks: PropTypes.func.isRequired
};

export default withApollo(NewTruckForm);
