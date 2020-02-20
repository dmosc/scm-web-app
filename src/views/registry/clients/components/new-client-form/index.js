import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { withApollo } from 'react-apollo';
import {
  Form,
  Icon,
  Input,
  InputNumber,
  Button,
  Select,
  Typography,
  Drawer,
  notification,
  Modal
} from 'antd';
import CFDIUseEnum from 'utils/enums/CFDIuse';
import PriceEditModal from './components/price-edit-modal';
import { REGISTER_CLIENT } from './graphql/mutations';
import { GET_PRODUCTS } from './graphql/queries';

const { Option } = Select;
const { Text } = Typography;

const NewClientForm = ({ form, visible, toggleNewClientModal, client, clients, setClients }) => {
  const [publicPrices, setPublicPrices] = useState({});
  const [prices, setPrices] = useState({});
  const [floorPrices, setFloorPrices] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPriceModal, togglePriceModal] = useState(false);
  const [currentPrice, setCurrentPrice] = useState(null);
  const [currentPriceTotal, setCurrentPriceTotal] = useState(0);
  const [currentFloorPrice, setCurrentFloorPrice] = useState(0);
  const [parsedPrices, setParsedPrices] = useState({});

  useEffect(() => {
    const getPublicPrices = async () => {
      const {
        data: { rocks: products }
      } = await client.query({ query: GET_PRODUCTS, variables: { filters: {} } });
      const publicPricesToSet = {};
      const floorPricesToSet = {};

      products.forEach(({ name, price, floorPrice }) => {
        publicPricesToSet[name] = price;
        floorPricesToSet[name] = floorPrice;
      });

      setPublicPrices(publicPricesToSet);
      setFloorPrices(floorPricesToSet);
    };

    getPublicPrices();
  }, [client]);

  useEffect(() => {
    const parsedPricesToSet = Object.keys(prices)
      .map(product => `${product}:${prices[product]}`)
      .filter(price => price.indexOf('null') === -1);

    setParsedPrices(parsedPricesToSet);
  }, [prices]);

  const handleSubmit = e => {
    e.preventDefault();
    const oldClients = [...clients];
    const oldPrices = { ...prices };

    // Remove all null prices
    Object.keys(oldPrices).forEach(key => oldPrices[key] == null && delete oldPrices[key]);

    setLoading(true);
    form.validateFields(
      async (
        err,
        { firstName, lastName, email, businessName, rfc, CFDIuse, cellphone, address, credit }
      ) => {
        if (!err) {
          try {
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
                  prices,
                  credit
                }
              }
            });

            const clientsToSet = [cli, ...oldClients];
            setLoading(false);
            setClients(clientsToSet);
            setCurrentPrice(null);
            setCurrentPriceTotal(0);
            setPrices({});

            notification.open({
              message: `Cliente ${cli.businessName} ha sido registrado exitosamente!`
            });

            toggleNewClientModal(false);

            form.resetFields();
          } catch (error) {
            error.graphQLErrors.map(({ message }) =>
              notification.open({
                message
              })
            );
            setLoading(false);
          }
        } else {
          setLoading(false);
        }
      }
    );
  };

  const onPriceUpdate = () => {
    const pricesToSet = { ...prices, [currentPrice]: currentPriceTotal };

    if (currentPriceTotal < currentFloorPrice) {
      Modal.error({
        title: 'Precio no permitido',
        content: 'No puedes asignar un precio menor al precio suelo'
      });
      delete pricesToSet[currentPrice];
    } else if (currentPriceTotal > publicPrices[currentPrice]) {
      Modal.error({
        title: 'Precio no permitido',
        content: 'No puedes asignar un precio mayor al precio al público'
      });
      delete pricesToSet[currentPrice];
    } else {
      pricesToSet[currentPrice] = currentPriceTotal;
    }

    setCurrentPrice(null);
    setCurrentPriceTotal(0);
    setPrices(pricesToSet);
    togglePriceModal(false);
  };

  const onPriceDeselect = price => {
    const pricesToSet = { ...prices };

    delete pricesToSet[price];
    setPrices(pricesToSet);
    setCurrentPrice(null);
    setCurrentPriceTotal(0);
    setCurrentFloorPrice(0);
  };

  const handleSetCurrentPrice = currentPriceToSet => {
    setCurrentFloorPrice(floorPrices[currentPriceToSet]);
    setCurrentPriceTotal(publicPrices[currentPriceToSet]);
    setCurrentPrice(currentPriceToSet);
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
          {form.getFieldDecorator('address', {
            rules: [{ required: true, message: 'Ingrese la dirección del cliente' }]
          })(
            <Input
              prefix={<Icon type="home" style={{ color: 'rgba(0,0,0,.25)' }} />}
              placeholder="Dirección física"
            />
          )}
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
        <Form.Item label="Precios especiales">
          {prices && (
            <Select
              defaultValue={Object.keys(prices).filter(price => prices[price])}
              placeholder="Precios especiales"
              mode="multiple"
              tokenSeparators={[',']}
              value={Object.keys(prices).filter(price => prices[price])}
              onSelect={handleSetCurrentPrice}
              onDeselect={onPriceDeselect}
            >
              {Object.keys(publicPrices)
                .filter(price => !prices[price])
                .map(product => (
                  <Option key={product} value={product}>
                    {product}
                  </Option>
                ))}
            </Select>
          )}
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
      <PriceEditModal
        visible={showPriceModal}
        currentPrice={currentPrice}
        currentPriceTotal={currentPriceTotal}
        currentFloorPrice={currentFloorPrice}
        currentPublicPrice={publicPrices[currentPrice]}
        setCurrentPriceTotal={setCurrentPriceTotal}
        onPriceUpdate={onPriceUpdate}
        togglePriceModal={togglePriceModal}
      />
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
