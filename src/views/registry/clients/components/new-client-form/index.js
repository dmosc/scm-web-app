import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { withApollo } from 'react-apollo';
import { Button, Drawer, Form, Icon, Input, InputNumber, Modal, notification, Select, Typography } from 'antd';
import CFDIUseEnum from 'utils/enums/CFDIuse';
import PriceEditModal from './components/price-edit-modal';
import { REGISTER_CLIENT } from './graphql/mutations';
import { GET_ROCKS } from './graphql/queries';

const { Option } = Select;
const { Text } = Typography;

const NewClientForm = ({ form, visible, toggleNewClientModal, client, clients, setClients }) => {
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPriceModal, togglePriceModal] = useState(false);
  const [currentPrice, setCurrentPrice] = useState(null);
  const [currentPriceTotal, setCurrentPriceTotal] = useState(0);
  const [parsedPrices, setParsedPrices] = useState({});
  const [rocks, setRocks] = useState([]);
  const [address, setAddress] = useState({});

  useEffect(() => {
    const getPublicPrices = async () => {
      const {
        data: { rocks: rocksToSet }
      } = await client.query({ query: GET_ROCKS, variables: { filters: {} } });

      setRocks(rocksToSet);
    };

    getPublicPrices();
  }, [client]);

  useEffect(() => {
    const parsedPricesToSet = prices.map(({ rock: { name }, price }) => `${name}:${price}`);

    setParsedPrices(parsedPricesToSet);
  }, [prices]);

  const handleSubmit = e => {
    e.preventDefault();
    const oldClients = [...clients];
    const oldPrices = [...prices];

    const newPrices = oldPrices.map(({ rock, price }) => ({ rock: rock.id, price }));

    setLoading(true);
    form.validateFields(
      async (
        err,
        { firstName, lastName, email, businessName, rfc, CFDIuse, cellphone, balance, credit }
      ) => {
        if (!err) {
          const {
            data: { client: cli }
          } = await client.mutate({
            mutation: REGISTER_CLIENT,
            variables: {
              client: {
                firstName,
                lastName,
                email,
                businessName,
                rfc,
                CFDIuse,
                cellphone,
                address,
                prices: newPrices,
                balance,
                credit
              }
            }
          });

          const clientsToSet = [cli, ...oldClients];
          setLoading(false);
          setClients(clientsToSet);
          setCurrentPrice(null);
          setCurrentPriceTotal(0);
          setPrices([]);
          setAddress({});

          notification.open({
            message: `Cliente ${cli.businessName} ha sido registrado exitosamente!`
          });

          toggleNewClientModal(false);

          form.resetFields();
        } else {
          setLoading(false);
        }
      }
    );
  };

  const onPriceUpdate = () => {
    let pricesToSet = [
      ...prices,
      {
        rock: {
          id: rocks[currentPrice].id,
          name: rocks[currentPrice].name
        },
        price: currentPriceTotal
      }
    ];

    if (currentPriceTotal < rocks[currentPrice].floorPrice) {
      Modal.error({
        title: 'Precio no permitido',
        content: 'No puedes asignar un precio menor al precio suelo'
      });
      pricesToSet = prices;
    } else if (currentPriceTotal > rocks[currentPrice].price) {
      Modal.error({
        title: 'Precio no permitido',
        content: 'No puedes asignar un precio mayor al precio al público'
      });
      pricesToSet = prices;
    }

    setCurrentPrice(null);
    setCurrentPriceTotal(0);
    setPrices(pricesToSet);
    togglePriceModal(false);
  };

  const onPriceDeselect = priceName => {
    const oldPrices = [...prices];
    const pricesToSet = [];

    oldPrices.forEach(price => {
      if (price.rock.name !== priceName) pricesToSet.push(price);
    });

    setPrices(pricesToSet);
    setCurrentPriceTotal(0);
    setCurrentPrice(null);
  };

  const handleSetCurrentPrice = currentPriceToSet => {
    setCurrentPrice(currentPriceToSet);
    setCurrentPriceTotal(rocks[currentPriceToSet].price);
    togglePriceModal(true);
  };

  return (
    <Drawer
      title="Añade un nuevo cliente"
      visible={visible}
      onClose={() => toggleNewClientModal(false)}
      width={600}
    >
      <Form onSubmit={handleSubmit}>
        <Form.Item>
          {form.getFieldDecorator('firstName', {
            rules: [
              {
                required: true,
                message: 'Nombre(s) del vendedor es requerido!'
              }
            ]
          })(
            <Input
              prefix={<Icon type="info" style={{ color: 'rgba(0,0,0,.25)' }} />}
              placeholder="Nombre(s)"
            />
          )}
        </Form.Item>
        <Form.Item>
          {form.getFieldDecorator('lastName', {
            rules: [
              {
                required: true,
                message: 'Apellidos del vendedor son requerido!'
              }
            ]
          })(
            <Input
              prefix={<Icon type="info" style={{ color: 'rgba(0,0,0,.25)' }} />}
              placeholder="Apellidos"
            />
          )}
        </Form.Item>
        <Form.Item>
          {form.getFieldDecorator('email')(
            <Input
              prefix={<Icon type="mail" style={{ color: 'rgba(0,0,0,.25)' }} />}
              placeholder="Email"
            />
          )}
        </Form.Item>
        <Form.Item>
          {form.getFieldDecorator('businessName')(
            <Input
              prefix={<Icon type="info" style={{ color: 'rgba(0,0,0,.25)' }} />}
              placeholder="Razón social"
            />
          )}
        </Form.Item>
        <Form.Item>
          {form.getFieldDecorator('rfc')(
            <Input
              prefix={<Icon type="number" style={{ color: 'rgba(0,0,0,.25)' }} />}
              placeholder="RFC"
            />
          )}
        </Form.Item>
        <Form.Item>
          {form.getFieldDecorator('CFDIuse', {
            rules: [{ required: true, message: 'Seleccione un uso de CFDI!' }]
          })(
            <Select placeholder="Uso de CFDI">
              {CFDIUseEnum.map(option => (
                <Option key={option} value={option}>
                  {`${option}`}
                </Option>
              ))}
            </Select>
          )}
        </Form.Item>
        <Form.Item>
          {form.getFieldDecorator('cellphone', {
            rules: [
              {
                required: true,
                message: 'Ingrese 1 o más números de contacto'
              }
            ]
          })(
            <Select
              placeholder="Números de contacto"
              mode="tags"
              maxTagCount={1}
              tokenSeparators={[',']}
            />
          )}
        </Form.Item>
        <Form.Item>
          <Input
            prefix={<Icon type="home" style={{ color: 'rgba(0,0,0,.25)' }}/>}
            placeholder="País"
            onChange={({ target: { value } }) => setAddress({ ...address, country: value })}
          />
        </Form.Item>
        <Form.Item>
          <Input
            prefix={<Icon type="home" style={{ color: 'rgba(0,0,0,.25)' }}/>}
            placeholder="Estado"
            onChange={({ target: { value } }) => setAddress({ ...address, state: value })}
          />
        </Form.Item>
        <Form.Item>
          <Input
            prefix={<Icon type="home" style={{ color: 'rgba(0,0,0,.25)' }}/>}
            placeholder="Municipio"
            onChange={({ target: { value } }) => setAddress({ ...address, municipality: value })}
          />
        </Form.Item>
        <Form.Item>
          <Input
            prefix={<Icon type="home" style={{ color: 'rgba(0,0,0,.25)' }}/>}
            placeholder="Ciudad"
            onChange={({ target: { value } }) => setAddress({ ...address, city: value })}
          />
        </Form.Item>
        <Form.Item>
          <Input
            prefix={<Icon type="home" style={{ color: 'rgba(0,0,0,.25)' }}/>}
            placeholder="Colonia"
            onChange={({ target: { value } }) => setAddress({ ...address, suburb: value })}
          />
        </Form.Item>
        <Form.Item>
          <Input
            prefix={<Icon type="home" style={{ color: 'rgba(0,0,0,.25)' }}/>}
            placeholder="Calle"
            onChange={({ target: { value } }) => setAddress({ ...address, street: value })}
          />
        </Form.Item>
        <Form.Item>
          <Input
            prefix={<Icon type="home" style={{ color: 'rgba(0,0,0,.25)' }}/>}
            placeholder="Número ext."
            onChange={({ target: { value } }) => setAddress({ ...address, intNumber: value })}
          />
        </Form.Item>
        <Form.Item>
          <Input
            prefix={<Icon type="home" style={{ color: 'rgba(0,0,0,.25)' }}/>}
            placeholder="Número int."
            onChange={({ target: { value } }) => setAddress({ ...address, extNumber: value })}
          />
        </Form.Item>
        <Form.Item>
          <Input
            prefix={<Icon type="home" style={{ color: 'rgba(0,0,0,.25)' }}/>}
            placeholder="Código Postal"
            onChange={({ target: { value } }) => setAddress({ ...address, zipcode: value })}
          />
        </Form.Item>
        <Form.Item label="Crédito inicial" style={{ color: 'rgba(0,0,0,.25)' }}>
          {form.getFieldDecorator('credit', { initialValue: 0 })(
            <InputNumber
              style={{ width: '100%' }}
              placeholder="Crédito inicial en MXN"
              min={0}
              step={0.1}
            />
          )}
        </Form.Item>
        <Form.Item label="Balance inicial" style={{ color: 'rgba(0,0,0,.25)' }}>
          {form.getFieldDecorator('balance', { initialValue: 0 })(
            <InputNumber
              style={{ width: '100%' }}
              placeholder="Balance inicial en MXN"
              min={0}
              step={0.1}
            />
          )}
        </Form.Item>
        <Form.Item label="Precios especiales">
          <Select
            placeholder="Precios especiales"
            mode="multiple"
            tokenSeparators={[',']}
            value={prices.map(({ rock: { name } }) => name)}
            onSelect={handleSetCurrentPrice}
            onDeselect={onPriceDeselect}
          >
            {rocks.map(({ id, name }, idx) => (
              <Option
                disabled={prices.some(({ rock: { id: rockId } }) => id === rockId)}
                key={id}
                value={idx}
              >
                {name}
              </Option>
            ))}
          </Select>
          <Text disabled>
            {parsedPrices.length > 0
              ? parsedPrices.join(', ')
              : 'Ningún precio especial seleccionado'}
          </Text>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" icon="save" loading={loading}>
            {(loading && 'Espere...') || 'Guardar'}
          </Button>
        </Form.Item>
      </Form>
      {currentPrice && (
        <PriceEditModal
          visible={showPriceModal}
          currentPrice={currentPrice}
          currentPriceTotal={currentPriceTotal}
          currentFloorPrice={rocks[currentPrice].floorPrice}
          currentPublicPrice={rocks[currentPrice].price}
          setCurrentPriceTotal={setCurrentPriceTotal}
          onPriceUpdate={onPriceUpdate}
          togglePriceModal={togglePriceModal}
        />
      )}
    </Drawer>
  );
};

NewClientForm.propTypes = {
  clients: PropTypes.arrayOf(PropTypes.object).isRequired,
  client: PropTypes.object.isRequired,
  form: PropTypes.object.isRequired,
  visible: PropTypes.bool.isRequired,
  toggleNewClientModal: PropTypes.func.isRequired,
  setClients: PropTypes.func.isRequired
};

export default withApollo(NewClientForm);
