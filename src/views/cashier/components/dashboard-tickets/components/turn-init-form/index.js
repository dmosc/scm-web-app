import React, { Component } from 'react';
import { withApollo } from 'react-apollo';
import periods from 'utils/enums/periods';
import { Form, Select, Button, Typography, notification } from 'antd';
import { INIT_TURN } from './graphql/mutations';

const { Title } = Typography;
const { Option } = Select;

class TurnInitForm extends Component {
  state = {
    loading: false,
    date: new Date()
  };

  componentDidMount = () => {
    this.clockID = setInterval(() => this.tick(), 1000);
  };

  componentWillUnmount = () => {
    clearInterval(this.clockID);
  };

  handleSubmit = e => {
    const {
      form,
      user: { id: user },
      client
    } = this.props;

    this.setState({ loading: true });
    e.preventDefault();
    form.validateFields(async (err, { period }) => {
      if (!err) {
        try {
          await client.mutate({ mutation: INIT_TURN, variables: { turn: { user, period } } });
        } catch (e) {
          notification.error({ message: e.toString() });
        }

        this.setState({ loading: false });
      } else {
        notification.error({ message: '¡Ha habido un error intentando iniciar el turno!' });
        this.setState({ loading: false });
      }
    });
  };

  tick = () => this.setState({ date: new Date() });

  render() {
    const { form } = this.props;
    const { loading, date } = this.state;

    return (
      <Form onSubmit={this.handleSubmit}>
        <Form.Item>
          <span>Turno empieza: </span>
          <Title>{date.toLocaleTimeString()}</Title>
        </Form.Item>
        <Form.Item>
          {form.getFieldDecorator('period')(
            <Select showSearch placeholder="Tipo de periodo">
              {periods.map(period => (
                <Option key={period} value={period}>
                  {`${period}`}
                </Option>
              ))}
            </Select>
          )}
        </Form.Item>
        <Form.Item>
          <Button block type="primary" htmlType="submit" icon="caret-right" loading={loading}>
            {(loading && 'Espere..') || 'Iniciar turno'}
          </Button>
        </Form.Item>
      </Form>
    );
  }
}

export default withApollo(TurnInitForm);
