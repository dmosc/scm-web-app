import React, {Component} from 'react';
import {withApollo} from 'react-apollo';
import debounce from 'debounce';
import {
  Form,
  Icon,
  Input,
  InputNumber,
  Button,
  Select,
  List,
  notification,
} from 'antd';
import ListContainer from './components/list';
import {REGISTER_TRUCK} from './graphql/mutations';
import {GET_TRUCKS, GET_CLIENTS} from './graphql/queries';

const {Option} = Select;

class TruckForm extends Component {
  state = {
    loading: false,
    loadingTrucks: false,
    loadingClients: false,
    trucks: [],
    clients: [],
    currentTruck: null,
  };

  componentDidMount = async () => {
    const {client} = this.props;
    this.setState({loadingTrucks: true});

    try {
      const {
        data: {trucks},
      } = await client.query({
        query: GET_TRUCKS,
        variables: {
          filters: {},
        },
      });

      if (!trucks) throw new Error('No trucks found');

      this.setState({trucks, loadingTrucks: false});
    } catch (e) {
      this.setState({loadingTrucks: false});
    }
  };

  handleSubmit = e => {
    const {form, client} = this.props;

    this.setState({loading: true});
    e.preventDefault();
    form.validateFields(
      async (err, {plates, brand, model, weight, client: cli, drivers}) => {
        if (!err) {
          try {
            const {
              data: {truck},
            } = await client.mutate({
              mutation: REGISTER_TRUCK,
              variables: {
                truck: {
                  plates,
                  brand,
                  model,
                  weight,
                  client: cli.substring(cli.indexOf(':') + 1),
                  drivers,
                },
              },
            });

            this.setState({loading: false});
            notification.open({
              message: `Camión ${truck.plates} ha sido registrado exitosamente!`,
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

  setCurrentTruck = currentTruck => this.setState({currentTruck});

  onSearch = search =>
    this.setState(
      {search, loadingClients: !!search, sellers: []},
      debounce(this.getClients(search), 1500)
    );

  getClients = async key => {
    const {client} = this.props;
    if (!key) {
      this.setState({clients: [], loadingClients: false});
      return;
    }

    this.setState({loadingClients: true});

    try {
      const {
        data: {clients},
      } = await client.query({
        query: GET_CLIENTS,
        variables: {
          filters: {limit: 10},
        },
      });

      this.setState({loadingClients: false, clients});
    } catch (e) {
      notification.open({message: e});
    }
  };

  render() {
    const {form} = this.props;
    const {
      loading,
      loadingTrucks,
      loadingClients,
      trucks,
      clients,
    } = this.state;

    return (
      <React.Fragment>
        <Form onSubmit={this.handleSubmit}>
          <Form.Item>
            {form.getFieldDecorator('client')(
              <Select
                showSearch
                style={{width: '100%'}}
                placeholder="Cliente"
                onSearch={this.onSearch}
                loading={loadingClients}
                allowClear
              >
                {clients.map(({id, businessName}) => (
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
                  message: 'Las placas del camión son requeridas!',
                },
              ],
            })(
              <Input
                prefix={
                  <Icon type="number" style={{color: 'rgba(0,0,0,.25)'}} />
                }
                placeholder="Placas"
              />
            )}
          </Form.Item>
          <Form.Item>
            {form.getFieldDecorator('brand', {
              rules: [
                {
                  required: true,
                  message: 'La marca del camión es requerida!',
                },
              ],
            })(
              <Input
                prefix={<Icon type="car" style={{color: 'rgba(0,0,0,.25)'}} />}
                placeholder="Marca"
              />
            )}
          </Form.Item>
          <Form.Item>
            {form.getFieldDecorator('model', {
              rules: [
                {
                  required: true,
                  message: 'El modelo es requerido!',
                },
              ],
            })(
              <Input
                prefix={
                  <Icon
                    type="unordered-list"
                    style={{color: 'rgba(0,0,0,.25)'}}
                  />
                }
                placeholder="Modelo"
              />
            )}
          </Form.Item>
          <Form.Item>
            {form.getFieldDecorator('weight', {
              rules: [
                {
                  required: true,
                  message: 'El peso del camión en KG es requerido!',
                },
              ],
            })(
              <InputNumber
                style={{width: '100%'}}
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
                  message: 'Ingrese 1 o más nombres de conductores',
                },
              ],
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
        <ListContainer title="Camiones registrados">
          {
            <List
              loading={loadingTrucks}
              itemLayout="horizontal"
              dataSource={trucks}
              size="small"
              renderItem={truck => (
                <List.Item
                  actions={[
                    <Icon
                      type="edit"
                      onClick={() => this.setCurrentTruck(truck)}
                    />,
                  ]}
                >
                  <List.Item.Meta
                    title={`${truck.plates}`}
                    description={`${truck.drivers.join(', ')},`}
                  />
                </List.Item>
              )}
            />
          }
        </ListContainer>
      </React.Fragment>
    );
  }
}

export default withApollo(TruckForm);