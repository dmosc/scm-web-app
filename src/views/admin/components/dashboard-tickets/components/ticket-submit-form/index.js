import React, {Component} from 'react';
import {withApollo} from 'react-apollo';
import {
  Form,
  Modal,
  Row,
  Select,
  Radio,
  InputNumber,
  Tooltip,
  Typography,
  notification,
} from 'antd';
import {TICKET_SUBMIT} from './graphql/mutations';
import {GET_TRUCK_DRIVERS} from './graphql/queries';

const {Option} = Select;
const {Group} = Radio;
const {Title, Text} = Typography;

class TicketSubmitForm extends Component {
  state = {
    drivers: [],
    weight: 0,
    total: 0,
    tax: 0,
  };

  componentDidMount = async () => {
    const {
      currentTicket: {
        truck: {id},
      },
      client,
    } = this.props;

    try {
      const {
        data: {
          truck: {drivers},
        },
      } = await client.query({query: GET_TRUCK_DRIVERS, variables: {id}});

      this.setState({drivers}, this.calculateTotal);
    } catch (e) {
      console.log(e);
    }
  };

  handleSubmit = e => {
    const {form, currentTicket, setCurrent, client} = this.props;

    const {id} = currentTicket;

    this.setState({loading: true});
    e.preventDefault();
    form.validateFields(async (err, {driver, weight, credit}) => {
      if (err) {
        this.setState({loading: false});
        return;
      }

      try {
        await client.mutate({
          mutation: TICKET_SUBMIT,
          variables: {
            ticket: {id, driver: driver[0], weight, credit},
          },
        });

        this.setState({loading: false});
        form.resetFields();
        setCurrent();
        notification.success({
          message: '¡La información ha sido actualizada correctamente!',
        });
      } catch (e) {
        this.setState({loading: false});
        notification.error({
          message: '¡Ha habido un error modificando la información!',
        });
      }
    });
  };

  handleCancel = () => {
    const {setCurrent} = this.props;

    setCurrent();
  };

  calculateTotal = () => {
    const TAX = 0.16;
    const {currentTicket} = this.props;
    const {weight} = this.state;

    const price = currentTicket.client.prices[currentTicket.product.name]
      ? currentTicket.client.prices[currentTicket.product.name]
      : currentTicket.product.price;

    const totalWeight =
      currentTicket.totalWeight && weight === 0
        ? currentTicket.totalWeight
        : ((weight - currentTicket.truck.weight)/1000).toFixed(2);
    const tax = currentTicket.client.bill ? totalWeight * price * TAX : 0;

    const total = (totalWeight * price + tax).toFixed(2);

    if (total > 0) this.setState({total, tax: tax.toFixed(2)});
    else this.setState({total: 0, tax: 0});
  };

  handleAttributeChange = (key, val) =>
    this.setState({[key]: val}, this.calculateTotal);

  render() {
    const {form, currentTicket, currentForm} = this.props;
    const {drivers, total, tax} = this.state;

    return (
      <Modal
        title={`${currentTicket.truck.plates}`}
        visible={currentForm === 'submit'}
        onCancel={this.handleCancel}
        onOk={this.handleSubmit}
      >
        <Form onSubmit={this.handleSubmit}>
          <Form.Item>
            {currentTicket.driver ? (
              form.getFieldDecorator('driver', {
                initialValue: [currentTicket.driver],
                rules: [
                  {
                    required: true,
                    message: 'Nombre(s) y apellidos son requeridos',
                  },
                ],
              })(
                <Select
                    mode="tags"
                    maxTagCount={1}
                    allowClear
                    showSearch
                    placeholder="Nombre(s) y apellidos del conductor"
                >
                  {drivers.map(driver => (
                      <Option key={driver} value={driver}>
                        {driver}
                      </Option>
                  ))}
                </Select>
              )
            ) : (
              form.getFieldDecorator('driver', {
                rules: [
                  {
                    required: true,
                    message: 'Nombre(s) y apellidos son requeridos',
                  },
                ],
              })(
                  <Select
                      mode="tags"
                      maxTagCount={1}
                      allowClear
                      showSearch
                      placeholder="Nombre(s) y apellidos del conductor"
                  >
                    {drivers.map(driver => (
                        <Option key={driver} value={driver}>
                          {driver}
                        </Option>
                    ))}
                  </Select>
              )
            )}
          </Form.Item>
          <Form.Item>
            {form.getFieldDecorator('weight', {
              initialValue: currentTicket.weight,
              rules: [
                {
                  required: true,
                  message:
                    '¡Los KG en báscula son requeridas!',
                },
              ],
            })(
              <InputNumber
                style={{width: '100%'}}
                placeholder="KG registrados en báscula"
                min={0}
                step={0.01}
                onChange={value => this.handleAttributeChange('weight', value)}
              />
            )}
          </Form.Item>
          <Form.Item>
            {form.getFieldDecorator('credit', {
              initialValue: currentTicket.credit ? currentTicket.credit : true,
            })(
              <Group>
                <Radio.Button value={false}>CONTADO</Radio.Button>
                <Tooltip
                  title={
                    currentTicket.client.credit < total
                      ? 'Cliente no tiene suficiente crédito para la transacción'
                      : `Cliente tiene disponible $${currentTicket.client.credit}`
                  }
                >
                  <Radio.Button
                    disabled={currentTicket.client.credit < total}
                    value={true}
                  >
                    CRÉDITO
                  </Radio.Button>
                </Tooltip>
              </Group>
            )}
          </Form.Item>
          <Row>
            <Text disabled>
              {total > 0 ? `Subtotal: $${(total - tax).toFixed(2)} MXN` : '-'}
            </Text>
          </Row>
          <Row>
            <Text disabled>{total > 0 ? `Tax: $${tax} MXN` : '-'}</Text>
          </Row>
          <Row>
            <Title level={4}>{`Total: $${total} MXN`}</Title>
          </Row>
        </Form>
      </Modal>
    );
  }
}

export default withApollo(TicketSubmitForm);
