import React, { Component } from 'react';
import { withApollo } from 'react-apollo';
import debounce from 'debounce';
import { Form, Icon, Input, InputNumber, Button, Select, Typography, notification } from 'antd';
import CFDIuse from 'utils/enums/CFDIuse';
import ClientList from './components/clients-list';
import PriceEditModal from './components/price-edit-modal';
import { TitleList, TitleContainer, FormContainer } from './elements';
import { REGISTER_CLIENT } from './graphql/mutations';
import { GET_CLIENTS, GET_PRODUCTS } from './graphql/queries';

const { Option } = Select;
const { Text } = Typography;

class ClientForm extends Component {
  state = {
    loading: false,
    showList: false,
    showPriceModal: false,
    clients: [],
    currentClient: null,
    currentPrice: null,
    currentPriceTotal: 0,
    prices: {},
    publicPrices: {},
    filters: {
      search: ''
    }
  };

  componentDidMount = async () => this.getData();

  getData = debounce(async () => {
    const { client } = this.props;
    const {
      filters: { search }
    } = this.state;

    this.setState({ loadingClients: true });

    try {
      const [
        {
          data: { clients }
        },
        {
          data: { rocks: products }
        }
      ] = await Promise.all([
        client.query({ query: GET_CLIENTS, variables: { filters: { search } } }),
        client.query({ query: GET_PRODUCTS, variables: { filters: {} } })
      ]);

      const publicPrices = {};

      products.forEach(({ name, price }) => (publicPrices[name] = price));
      this.setState({ publicPrices });

      this.setState({ clients });
    } catch (e) {
      notification.open({
        message: `No se han podido cargar los clientes correctamente.`
      });
    }
  }, 300);

  handleSubmit = e => {
    const { form, client } = this.props;
    const { clients: oldClients, prices: oldPrices } = this.state;

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

            const clients = [cli, ...oldClients];
            this.setState({
              loading: false,
              clients,
              currentClient: null,
              currentPrice: null,
              currentPriceTotal: 0,
              prices: {}
            });

            notification.open({
              message: `Cliente ${cli.businessName} ha sido registrado exitosamente!`
            });

            form.resetFields();
            window.location.reload();
          } catch (e) {
            e['graphQLErrors'].map(({ message }) =>
              notification.open({
                message
              })
            );
            this.setState({ loading: false });
          }
        } else {
          this.setState({ loading: false });
        }
      }
    );
  };

  toggleList = () => {
    const { showList } = this.state;
    this.setState({ showList: !showList });
  };

  onClientEdit = client => {
    const { clients: oldClients } = this.state;
    const clients = [...oldClients];

    clients.forEach(({ id }, i) => {
      if (client.id === id) clients[i] = { ...client };
    });

    this.setState({ clients });
  };

  setCurrentPrice = currentPrice => {
    const { publicPrices } = this.state;

    this.setState(
      { currentPrice, currentPriceTotal: publicPrices[currentPrice] },
      this.togglePriceModal()
    );
  };

  onPriceUpdate = () => {
    const { prices: oldPrices, currentPrice, currentPriceTotal } = this.state;
    const prices = { ...oldPrices, [currentPrice]: currentPriceTotal };

    this.setState({ prices, currentPrice: null, currentPriceTotal: 0 }, this.togglePriceModal());
  };

  onPriceDeselect = price => {
    const { prices: oldPrices } = this.state;
    const prices = { ...oldPrices };

    delete prices[price];
    this.setState({ prices, currentPrice: null, currentPriceTotal: 0 });
  };

  togglePriceModal = () => {
    const { showPriceModal } = this.state;

    this.setState({ showPriceModal: !showPriceModal });
  };

  handleAttrChange = (key, val) => this.setState({ [key]: val });

  handleFilterChange = (key, value) => {
    const { filters: oldFilters } = this.state;

    const filters = { ...oldFilters, [key]: value };

    this.setState({ filters }, this.getData);
  };

  render() {
    const { form } = this.props;
    const {
      loading,
      showList,
      showPriceModal,
      clients,
      prices,
      publicPrices,
      currentPrice,
      currentPriceTotal
    } = this.state;

    const parsedPrices = Object.keys(prices)
      .map(product => `${product}:${prices[product]}`)
      .filter(price => price.indexOf('null') === -1);

    return (
      <FormContainer>
        <TitleContainer>
          <TitleList>Registrar cliente</TitleList>
          <Button type="link" onClick={this.toggleList}>
            Ver clientes
          </Button>
        </TitleContainer>
        <Form onSubmit={this.handleSubmit}>
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
                {CFDIuse.map(option => (
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
        <ClientList
          visible={showList}
          clients={clients}
          handleFilterChange={this.handleFilterChange}
          onClientEdit={this.onClientEdit}
          toggleList={this.toggleList}
        />
      </FormContainer>
    );
  }
}

export default withApollo(ClientForm);
