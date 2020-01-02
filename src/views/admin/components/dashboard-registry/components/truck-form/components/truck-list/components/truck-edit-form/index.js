import React, {Component} from 'react';
import {withApollo} from 'react-apollo';
import debounce from 'debounce';
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  Icon,
  notification,
} from 'antd';
import {GET_CLIENTS} from './graphql/queries';
import {EDIT_TRUCK} from './graphql/mutations';

const {Option} = Select;

class EditForm extends Component {
  state = {
    loading: false,
    loadingClients: false,
    clients: [],
  };

  handleSubmit = e => {
    const {
      form,
      currentTruck: {id},
      setCurrentTruck,
      onTruckEdit,
      client,
    } = this.props;

    this.setState({loading: true});
    e.preventDefault();
    form.validateFields(
      async (err, {plates, brand, model, weight, client: cli, drivers}) => {
        if (!err) {
          try {
            const {
              data: {truckEdit: truck},
            } = await client.mutate({
              mutation: EDIT_TRUCK,
              variables: {
                truck: {
                  id,
                  plates,
                  brand,
                  model,
                  weight,
                  client: cli.substring(cli.indexOf(':') + 1),
                  drivers,
                },
              },
            });

            notification.open({
              message: `Camión ${truck.plates} ha sido editado exitosamente!`,
            });

            onTruckEdit(truck);
            setCurrentTruck();
            form.resetFields();
          } catch (e) {
            console.log(e);
            notification.open({
              message: 'Ha habido un error actualizando el camión',
            });
            this.setState({loading: false});
          }
        } else {
          this.setState({loading: false});
        }
      }
    );
  };

  onSearch = search =>
    this.setState(
      {search, loadingClients: !!search, clients: []},
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

  handleCancel = () => {
    const {setCurrentTruck} = this.props;

    setCurrentTruck();
  };

  render() {
    const {form, currentTruck} = this.props;
    const {loading, loadingClients, clients} = this.state;

    return (
      <Modal
        title={`Editando camión: ${currentTruck.plates}`}
        visible={currentTruck !== null}
        footer={null}
        onCancel={this.handleCancel}
      >
        <Form onSubmit={this.handleSubmit}>
          <Form.Item>
            {form.getFieldDecorator('client', {
              initialValue: currentTruck.client.id,
              rules: [{required: true}],
            })(
              <Select
                disabled
                showSearch
                style={{width: '100%'}}
                placeholder={currentTruck.client.businessName}
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
              initialValue: currentTruck.plates,
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
              initialValue: currentTruck.brand,
            })(
              <Input
                prefix={<Icon type="car" style={{color: 'rgba(0,0,0,.25)'}} />}
                placeholder="Marca"
              />
            )}
          </Form.Item>
          <Form.Item>
            {form.getFieldDecorator('model', {
              initialValue: currentTruck.model,
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
              initialValue: currentTruck.weight,
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
              initialValue: currentTruck.drivers,
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
      </Modal>
    );
  }
}

export default withApollo(EditForm);
