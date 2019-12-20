import React, {Component} from 'react';
import {withApollo} from 'react-apollo';
import {
  Form,
  Icon,
  Radio,
  Input,
  InputNumber,
  Button,
  Select,
  notification,
} from 'antd';
import ClientList from './components/clients-list';
import {TitleList, TitleContainer, FormContainer} from './elements';
import {REGISTER_CLIENT} from './graphql/mutations';
import {GET_CLIENTS} from './graphql/queries';

const {Option} = Select;
const {Group} = Radio;

class ClientForm extends Component {
  state = {
    loading: false,
    visible: false,
    clients: [],
    CFDIuse: ['G01', 'G03'],
  };

  componentDidMount = async () => {
    const {client} = this.props;

    try {
      const {
        data: {clients},
      } = await client.query({
        query: GET_CLIENTS,
        variables: {
          filters: {},
        },
      });

      if (!clients) throw new Error('No clients found');

      this.setState({clients});
    } catch (e) {
      notification.open({
        message: `No se han podido cargar los clientes correctamente.`,
      });
    }
  };

  handleSubmit = e => {
    const {form, client} = this.props;
    const {clients: oldClients} = this.state;

    this.setState({loading: true});
    e.preventDefault();
    form.validateFields(
      async (
        err,
        {
          firstName,
          lastName,
          email,
          trucks,
          businessName,
          rfc,
          CFDIuse,
          cellphone,
          address,
          prices,
          credit,
          bill,
        }
      ) => {
        if (!err) {
          try {
            const {
              data: {client: cli},
            } = await client.mutate({
              mutation: REGISTER_CLIENT,
              variables: {
                client: {
                  firstName,
                  lastName,
                  email,
                  trucks: [],
                  businessName,
                  rfc,
                  CFDIuse,
                  cellphone,
                  address,
                  prices: {},
                  credit,
                  bill,
                },
              },
            });

            const clients = [cli, ...oldClients];
            this.setState({loading: false, clients});

            notification.open({
              message: `Cliente ${cli.businessName} ha sido registrado exitosamente!`,
            });

            form.resetFields();
          } catch (e) {
            e['graphQLErrors'].map(({message}) =>
              notification.open({
                message,
              })
            );
            this.setState({loading: false});
          }
        } else {
          this.setState({loading: false});
        }
      }
    );
  };

  toggleList = () => {
    const {visible} = this.state;
    this.setState({visible: !visible});
  };

  render() {
    const {form} = this.props;
    const {loading, visible, clients, CFDIuse} = this.state;

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
                  message: 'Nombre(s) del vendedor es requerido!',
                },
              ],
            })(
              <Input
                prefix={<Icon type="info" style={{color: 'rgba(0,0,0,.25)'}} />}
                placeholder="Nombre(s)"
              />
            )}
          </Form.Item>
          <Form.Item>
            {form.getFieldDecorator('lastName', {
              rules: [
                {
                  required: true,
                  message: 'Apellidos del vendedor son requerido!',
                },
              ],
            })(
              <Input
                prefix={<Icon type="info" style={{color: 'rgba(0,0,0,.25)'}} />}
                placeholder="Apellidos"
              />
            )}
          </Form.Item>
          <Form.Item>
            {form.getFieldDecorator('email')(
              <Input
                prefix={<Icon type="mail" style={{color: 'rgba(0,0,0,.25)'}} />}
                placeholder="Email"
              />
            )}
          </Form.Item>
          <Form.Item>
            {form.getFieldDecorator('businessName')(
              <Input
                prefix={<Icon type="info" style={{color: 'rgba(0,0,0,.25)'}} />}
                placeholder="Razón social"
              />
            )}
          </Form.Item>
          <Form.Item>
            {form.getFieldDecorator('rfc')(
              <Input
                prefix={
                  <Icon type="number" style={{color: 'rgba(0,0,0,.25)'}} />
                }
                placeholder="RFC"
              />
            )}
          </Form.Item>
          <Form.Item>
            {form.getFieldDecorator('CFDIuse', {
              rules: [{required: true, message: 'Seleccione un uso de CFDI!'}],
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
                  message: 'Ingrese 1 o más números de contacto',
                },
              ],
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
              rules: [
                {required: true, message: 'Ingrese la dirección del cliente'},
              ],
            })(
              <Input
                prefix={<Icon type="home" style={{color: 'rgba(0,0,0,.25)'}} />}
                placeholder="Dirección física"
              />
            )}
          </Form.Item>
          <Form.Item label="Crédito inicial" style={{color: 'rgba(0,0,0,.25)'}}>
            {form.getFieldDecorator('credit', {initialValue: 0})(
              <InputNumber
                style={{width: '100%'}}
                placeholder="Crédito inicial en MXN"
                min={0}
                step={0.1}
              />
            )}
          </Form.Item>
          <Form.Item>
            {form.getFieldDecorator('bill')(
              <Group>
                <Radio.Button value={false}>REMISIÓN</Radio.Button>
                <Radio.Button value={true}>FACTURA</Radio.Button>
              </Group>
            )}
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              icon="save"
              loading={loading}
            >
              {(loading && 'Espere..') || 'Guardar'}
            </Button>
          </Form.Item>
        </Form>
        <ClientList
          visible={visible}
          clients={clients}
          toggleList={this.toggleList}
        />
      </FormContainer>
    );
  }
}

export default withApollo(ClientForm);
