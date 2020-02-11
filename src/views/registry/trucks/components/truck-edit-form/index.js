import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withApollo } from 'react-apollo';
import { Drawer, Form, Input, InputNumber, Select, Button, Icon, notification } from 'antd';
import { EDIT_TRUCK } from './graphql/mutations';

const { Option } = Select;

class EditForm extends Component {
  state = {
    loading: false
  };

  handleSubmit = e => {
    const {
      form,
      currentTruck: { id },
      setCurrentTruck,
      onTruckEdit,
      client
    } = this.props;

    e.preventDefault();
    this.setState({ loading: true });
    form.validateFields(async (err, { plates, brand, model, weight, cli, drivers }) => {
      if (!err) {
        try {
          const {
            data: { truckEdit: truck }
          } = await client.mutate({
            mutation: EDIT_TRUCK,
            variables: {
              truck: {
                id,
                plates,
                brand,
                model,
                weight,
                client: cli,
                drivers
              }
            }
          });

          notification.open({
            message: `Camión ${truck.plates} ha sido editado exitosamente!`
          });

          onTruckEdit(truck);
          setCurrentTruck();
          form.resetFields();
        } catch (error) {
          notification.open({
            message: 'Ha habido un error actualizando el camión'
          });
        }
        this.setState({ loading: false });
      } else {
        this.setState({ loading: false });
      }
    });
  };

  handleCancel = () => {
    const { setCurrentTruck } = this.props;

    setCurrentTruck();
  };

  render() {
    const { currentTruck, form } = this.props;
    const { loading } = this.state;

    return (
      <Drawer
        title={`Editando camión: ${currentTruck.plates}`}
        visible={currentTruck !== null}
        onClose={this.handleCancel}
        width={600}
      >
        <Form onSubmit={this.handleSubmit}>
          <Form.Item>
            {form.getFieldDecorator('client', {
              initialValue: currentTruck.client.businessName,
              rules: [{ required: true }]
            })(
              <Select disabled>
                <Option value={currentTruck.client.id}>
                  <span>{currentTruck.client.buinessName}</span>
                </Option>
              </Select>
            )}
          </Form.Item>
          <Form.Item>
            {form.getFieldDecorator('plates', {
              initialValue: currentTruck.plates
            })(
              <Input
                prefix={<Icon type="number" style={{ color: 'rgba(0,0,0,.25)' }} />}
                placeholder="Placas"
              />
            )}
          </Form.Item>
          <Form.Item>
            {form.getFieldDecorator('brand', {
              initialValue: currentTruck.brand
            })(
              <Input
                prefix={<Icon type="car" style={{ color: 'rgba(0,0,0,.25)' }} />}
                placeholder="Marca"
              />
            )}
          </Form.Item>
          <Form.Item>
            {form.getFieldDecorator('model', {
              initialValue: currentTruck.model
            })(
              <Input
                prefix={<Icon type="unordered-list" style={{ color: 'rgba(0,0,0,.25)' }} />}
                placeholder="Modelo"
              />
            )}
          </Form.Item>
          <Form.Item>
            {form.getFieldDecorator('weight', {
              initialValue: currentTruck.weight
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
              initialValue: currentTruck.drivers
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
              {(loading && 'Espere..') || 'Guardar'}
            </Button>
          </Form.Item>
        </Form>
      </Drawer>
    );
  }
}

EditForm.propTypes = {
  client: PropTypes.object.isRequired,
  form: PropTypes.object.isRequired,
  currentTruck: PropTypes.object.isRequired,
  setCurrentTruck: PropTypes.func.isRequired,
  onTruckEdit: PropTypes.func.isRequired
};

export default withApollo(EditForm);
