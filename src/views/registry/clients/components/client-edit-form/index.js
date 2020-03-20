import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withApollo } from 'react-apollo';
import { Button, Drawer, Form, Icon, Input, InputNumber, Modal, notification, Select, Typography } from 'antd';
import CFDIuseComponent from 'utils/enums/CFDIuse';
import PriceEditModal from './components/price-edit-modal';
import { GET_ROCKS } from './graphql/queries';
import { EDIT_CLIENT } from './graphql/mutations';

const { Option } = Select;
const { Text } = Typography;

class EditForm extends Component {
  state = {
    loading: false,
    showPriceModal: false,
    prices: [],
    currentPrice: null,
    currentPriceTotal: 0,
    rocks: []
  };

  componentDidMount = async () => {
    const { currentClient, client } = this.props;

    const {
      data: { rocks }
    } = await client.query({ query: GET_ROCKS, variables: { filters: {} } });

    const prices = [...currentClient.prices];

    this.setState({ prices, rocks });
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

    const prices = oldPrices.map(({ rock, price }) => ({ rock: rock.id, price }));

    this.setState({ loading: true });
    e.preventDefault();
    form.validateFields(
      async (
        err,
        {
          firstName,
          lastName,
          email,
          businessName,
          rfc,
          CFDIuse,
          cellphone,
          country,
          state,
          city,
          suburb,
          municipality,
          street,
          extNumber,
          intNumber,
          zipcode,
          balance,
          credit
        }
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
                  address: {
                    country,
                    state,
                    city,
                    suburb,
                    municipality,
                    street,
                    extNumber,
                    intNumber,
                    zipcode
                  },
                  prices,
                  balance,
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
    const { rocks } = this.state;

    this.setState(
      {
        currentPrice,
        currentPriceTotal: rocks[currentPrice].price
      },
      this.togglePriceModal()
    );
  };

  onPriceUpdate = () => {
    const { prices: oldPrices, currentPrice, currentPriceTotal, rocks } = this.state;

    let prices = [
      ...oldPrices,
      {
        rock: {
          id: rocks[currentPrice].id,
          name: rocks[currentPrice].name,
          price: rocks[currentPrice].price,
          floorPrice: rocks[currentPrice].floorPrice
        },
        price: currentPriceTotal
      }
    ];

    if (currentPriceTotal < rocks[currentPrice].floorPrice) {
      Modal.error({
        title: 'Precio no permitido',
        content: 'No puedes asignar un precio menor al precio suelo'
      });
      prices = oldPrices;
    } else if (currentPriceTotal > rocks[currentPrice].price) {
      Modal.error({
        title: 'Precio no permitido',
        content: 'No puedes asignar un precio mayor al precio al público'
      });
      prices = oldPrices;
    }

    this.setState({ prices, currentPrice: null, currentPriceTotal: 0 }, this.togglePriceModal());
  };

  onPriceDeselect = priceName => {
    const { prices: oldPrices } = this.state;
    const prices = [];

    oldPrices.forEach(price => {
      if (price.rock.name !== priceName) prices.push(price);
    });

    this.setState({ prices, currentPrice: null, currentPriceTotal: 0 });
  };

  togglePriceModal = () => {
    const { showPriceModal } = this.state;

    this.setState({ showPriceModal: !showPriceModal });
  };

  handleAttrChange = (key, val) => this.setState({ [key]: val });

  render() {
    const { form, currentClient } = this.props;
    const { loading, showPriceModal, prices, currentPrice, currentPriceTotal, rocks } = this.state;

    delete currentClient.prices.__typename;

    const parsedPrices = prices.map(({ rock, price }) => `${rock.name}:${price}`);

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
            {form.getFieldDecorator('country', {
              initialValue: currentClient?.address?.country,
              rules: [{ required: true, message: 'Ingrese el país del cliente' }]
            })(
              <Input
                prefix={<Icon type="home" style={{ color: 'rgba(0,0,0,.25)' }} />}
                placeholder="País"
              />
            )}
          </Form.Item>
          <Form.Item>
            {form.getFieldDecorator('state', {
              initialValue: currentClient?.address?.state,
              rules: [{ required: true, message: 'Ingrese el estado del cliente' }]
            })(
              <Input
                prefix={<Icon type="home" style={{ color: 'rgba(0,0,0,.25)' }} />}
                placeholder="Estado"
              />
            )}
          </Form.Item>
          <Form.Item>
            {form.getFieldDecorator('municipality', {
              initialValue: currentClient?.address?.municipality,
              rules: [{ required: true, message: 'Ingrese el municipio del cliente' }]
            })(
              <Input
                prefix={<Icon type="home" style={{ color: 'rgba(0,0,0,.25)' }} />}
                placeholder="Municipio"
              />
            )}
          </Form.Item>
          <Form.Item>
            {form.getFieldDecorator('city', {
              initialValue: currentClient?.address?.city,
              rules: [{ required: true, message: 'Ingrese la ciudad del cliente' }]
            })(
              <Input
                prefix={<Icon type="home" style={{ color: 'rgba(0,0,0,.25)' }} />}
                placeholder="Ciudad"
              />
            )}
          </Form.Item>
          <Form.Item>
            {form.getFieldDecorator('suburb', {
              initialValue: currentClient?.address?.suburb,
              rules: [{ required: true, message: 'Ingrese la colonia del cliente' }]
            })(
              <Input
                prefix={<Icon type="home" style={{ color: 'rgba(0,0,0,.25)' }} />}
                placeholder="Colonia"
              />
            )}
          </Form.Item>
          <Form.Item>
            {form.getFieldDecorator('street', {
              initialValue: currentClient?.address?.street,
              rules: [{ required: true, message: 'Ingrese la calle del cliente' }]
            })(
              <Input
                prefix={<Icon type="home" style={{ color: 'rgba(0,0,0,.25)' }} />}
                placeholder="Calle"
              />
            )}
          </Form.Item>
          <Form.Item>
            {form.getFieldDecorator('extNumber', {
              initialValue: currentClient?.address?.extNumber,
              rules: [{ required: false, message: 'Ingrese número exterior del cliente' }]
            })(
              <Input
                prefix={<Icon type="home" style={{ color: 'rgba(0,0,0,.25)' }} />}
                placeholder="Número ext."
              />
            )}
          </Form.Item>
          <Form.Item>
            {form.getFieldDecorator('intNumber', {
              initialValue: currentClient?.address?.intNumber,
              rules: [{ required: true, message: 'Ingrese número interior del cliente' }]
            })(
              <Input
                prefix={<Icon type="home" style={{ color: 'rgba(0,0,0,.25)' }} />}
                placeholder="Número int."
              />
            )}
          </Form.Item>
          <Form.Item>
            {form.getFieldDecorator('zipcode', {
              initialValue: currentClient?.address?.zipcode,
              rules: [{ required: true, message: 'Ingrese el código postal del cliente' }]
            })(
              <Input
                prefix={<Icon type="home" style={{ color: 'rgba(0,0,0,.25)' }} />}
                placeholder="Código postal"
              />
            )}
          </Form.Item>
          <Form.Item label="Crédito actual" style={{ color: 'rgba(0,0,0,.25)' }}>
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
          <Form.Item label="Balance actual" style={{ color: 'rgba(0,0,0,.25)' }}>
            {form.getFieldDecorator('balance', {
              initialValue: currentClient.balance ? currentClient.balance : 0
            })(
              <InputNumber
                style={{ width: '100%' }}
                placeholder="Balance en MXN"
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
              onSelect={this.setCurrentPrice}
              onDeselect={this.onPriceDeselect}
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
              {(loading && 'Espere..') || 'Guardar'}
            </Button>
          </Form.Item>
        </Form>
        {currentPrice !== null && (
          <PriceEditModal
            visible={showPriceModal}
            currentPrice={currentPrice}
            currentPriceTotal={currentPriceTotal}
            currentFloorPrice={rocks[currentPrice].floorPrice}
            currentPublicPrice={rocks[currentPrice].price}
            handleAttrChange={this.handleAttrChange}
            onPriceUpdate={this.onPriceUpdate}
            togglePriceModal={this.togglePriceModal}
          />
        )}
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
