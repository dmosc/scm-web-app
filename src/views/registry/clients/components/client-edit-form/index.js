import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withApollo } from 'react-apollo';
import {
  Drawer,
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  Icon,
  Typography,
  notification,
  Modal
} from 'antd';
import CFDIuseComponent from 'utils/enums/CFDIuse';
import PriceEditModal from './components/price-edit-modal';
import { GET_PRODUCTS } from './graphql/queries';
import { EDIT_CLIENT } from './graphql/mutations';

const { Option } = Select;
const { Text } = Typography;

class EditForm extends Component {
  state = {
    loading: false,
    showPriceModal: false,
    prices: {},
    publicPrices: {},
    floorPrices: {},
    currentPrice: null,
    currentFloorPriceTotal: 0,
    currentPriceTotal: 0
  };

  componentDidMount = async () => {
    const { currentClient, client } = this.props;

    const {
      data: { rocks: products }
    } = await client.query({ query: GET_PRODUCTS, variables: { filters: {} } });

    const prices = { ...currentClient.prices };
    const publicPrices = {};
    const floorPrices = {};

    products.forEach(({ name, price, floorPrice }) => {
      publicPrices[name] = price;
      floorPrices[name] = floorPrice;
    });
    this.setState({ prices, publicPrices, floorPrices });
  };

  handleSubmit = e => {
    const {
      form,
      onClientEdit,
      currentClient: { id },
      setCurrentClient,
      client
    } = this.props;
    const { prices: oldPrices } = this.state;

    const prices = { ...oldPrices };

    // Remove all null prices
    Object.keys(prices).forEach(key => prices[key] == null && delete prices[key]);

    this.setState({ loading: true });
    e.preventDefault();
    form.validateFields(
      async (
        err,
        { firstName, lastName, email, businessName, rfc, CFDIuse, cellphone, address, credit }
      ) => {
        if (!err) {
          try {
            const {
              data: { clientEdit: cli }
            } = await client.mutate({
              mutation: EDIT_CLIENT,
              variables: {
                client: {
                  id,
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

            notification.open({
              message: `Cliente ${cli.businessName} ha sido editado exitosamente!`
            });

            onClientEdit(cli);
            form.resetFields();
            setCurrentClient();
          } catch (error) {
            notification.open({
              message: 'Ha habido un error modificando la información'
            });
            this.setState({ loading: false });
          }
        } else {
          this.setState({ loading: false });
        }
      }
    );
  };

  handleCancel = () => {
    const { setCurrentClient } = this.props;

    setCurrentClient();
  };

  setCurrentPrice = currentPrice => {
    const { publicPrices, floorPrices } = this.state;

    this.setState(
      {
        currentPrice,
        currentPriceTotal: publicPrices[currentPrice],
        currentFloorPriceTotal: floorPrices[currentPrice]
      },
      this.togglePriceModal()
    );
  };

  onPriceUpdate = () => {
    const {
      prices: oldPrices,
      currentPrice,
      currentPriceTotal,
      currentFloorPriceTotal
    } = this.state;

    const prices = { ...oldPrices };

    if (currentPriceTotal < currentFloorPriceTotal) {
      Modal.error({
        title: 'Precio no permitido',
        content: 'No puedes asignar un precio menor al precio suelo'
      });
      delete prices[currentPrice];
    } else {
      prices[currentPrice] = currentPriceTotal;
    }

    this.setState(
      { prices, currentPrice: null, currentPriceTotal: 0, currentFloorPriceTotal: 0 },
      this.togglePriceModal()
    );
  };

  onPriceDeselect = price => {
    const { prices: oldPrices } = this.state;
    const prices = { ...oldPrices };

    delete prices[price];
    this.setState({ prices, currentPrice: null, currentPriceTotal: 0, currentFloorPriceTotal: 0 });
  };

  togglePriceModal = () => {
    const { showPriceModal } = this.state;

    this.setState({ showPriceModal: !showPriceModal });
  };

  handleAttrChange = (key, val) => this.setState({ [key]: val });

  render() {
    const { form, currentClient } = this.props;
    const {
      loading,
      showPriceModal,
      prices,
      currentPrice,
      currentPriceTotal,
      publicPrices
    } = this.state;

    delete currentClient.prices.__typename;

    const parsedPrices = Object.keys(prices)
      .map(product => `${product}:${prices[product]}`)
      .filter(price => price.indexOf('null') === -1);

    return (
      <Drawer
        title={`Editando cliente: ${currentClient.businessName}`}
        visible={currentClient !== null}
        onClose={this.handleCancel}
        width={600}
      >
        <Form onSubmit={this.handleSubmit}>
          <Form.Item>
            {form.getFieldDecorator('firstName', { initialValue: currentClient.firstName })(
              <Input
                prefix={<Icon type="info" style={{ color: 'rgba(0,0,0,.25)' }} />}
                placeholder="Nombre(s)"
              />
            )}
          </Form.Item>
          <Form.Item>
            {form.getFieldDecorator('lastName', { initialValue: currentClient.lastName })(
              <Input
                prefix={<Icon type="info" style={{ color: 'rgba(0,0,0,.25)' }} />}
                placeholder="Apellidos"
              />
            )}
          </Form.Item>
          <Form.Item>
            {form.getFieldDecorator('email', { initialValue: currentClient.email })(
              <Input
                prefix={<Icon type="mail" style={{ color: 'rgba(0,0,0,.25)' }} />}
                placeholder="Email"
              />
            )}
          </Form.Item>
          <Form.Item>
            {form.getFieldDecorator('businessName', { initialValue: currentClient.businessName })(
              <Input
                prefix={<Icon type="info" style={{ color: 'rgba(0,0,0,.25)' }} />}
                placeholder="Razón social"
              />
            )}
          </Form.Item>
          <Form.Item>
            {form.getFieldDecorator('rfc', { initialValue: currentClient.rfc })(
              <Input
                prefix={<Icon type="number" style={{ color: 'rgba(0,0,0,.25)' }} />}
                placeholder="RFC"
              />
            )}
          </Form.Item>
          <Form.Item>
            {form.getFieldDecorator('CFDIuse', {
              initialValue: currentClient.CFDIuse,
              rules: [{ required: true, message: 'Seleccione un uso de CFDI!' }]
            })(
              <Select placeholder="Uso de CFDI">
                {CFDIuseComponent.map(option => (
                  <Option key={option} value={option}>
                    {`${option}`}
                  </Option>
                ))}
              </Select>
            )}
          </Form.Item>
          <Form.Item>
            {form.getFieldDecorator('cellphone', { initialValue: currentClient.cellphone })(
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
              initialValue: currentClient.address,
              rules: [{ required: true, message: 'Ingrese la dirección del cliente' }]
            })(
              <Input
                prefix={<Icon type="home" style={{ color: 'rgba(0,0,0,.25)' }} />}
                placeholder="Dirección física"
              />
            )}
          </Form.Item>
          <Form.Item label="Crédito" style={{ color: 'rgba(0,0,0,.25)' }}>
            {form.getFieldDecorator('credit', {
              initialValue: currentClient.credit ? currentClient.credit : 0
            })(
              <InputNumber
                style={{ width: '100%' }}
                placeholder="Crédito en MXN"
                min={0}
                step={0.1}
              />
            )}
          </Form.Item>
          <Form.Item label="Precios especiales">
            {prices && (
              <Select
                defaultValue={Object.keys(currentClient.prices).filter(
                  price => currentClient.prices[price]
                )}
                placeholder="Precios especiales"
                mode="multiple"
                tokenSeparators={[',']}
                value={Object.keys(prices).filter(price => prices[price])}
                onSelect={this.setCurrentPrice}
                onDeselect={this.onPriceDeselect}
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
              {(loading && 'Espere..') || 'Guardar'}
            </Button>
          </Form.Item>
        </Form>
        <PriceEditModal
          visible={showPriceModal}
          currentPrice={currentPrice}
          currentPriceTotal={currentPriceTotal}
          handleAttrChange={this.handleAttrChange}
          onPriceUpdate={this.onPriceUpdate}
          togglePriceModal={this.togglePriceModal}
        />
      </Drawer>
    );
  }
}

EditForm.propTypes = {
  client: PropTypes.object.isRequired,
  form: PropTypes.object.isRequired,
  currentClient: PropTypes.object.isRequired,
  onClientEdit: PropTypes.func.isRequired,
  setCurrentClient: PropTypes.func.isRequired
};

export default withApollo(EditForm);
