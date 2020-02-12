import React, { Component } from 'react';
import { withApollo } from 'react-apollo';
import { Form, Button, Input, notification } from 'antd';
import { REGISTER_MESSAGE } from './graphql/mutations';

class MessageForm extends Component {
  state = {
    loading: false,
    content: ''
  };

  sendMessage = async e => {
    const {
      user: { username },
      client
    } = this.props;
    const { content } = this.state;

    this.setState({ loading: true });
    e.preventDefault();

    try {
      await client.mutate({
        mutation: REGISTER_MESSAGE,
        variables: { message: { username, content } }
      });

      this.setState({ loading: false, content: '' });
    } catch (e) {
      notification.error({
        message: 'No se ha podido enviar el mensaje'
      });
      this.setState({ loading: false, content: '' });
    }
  };

  setContent = content => this.setState({ content });

  render() {
    const { loading, content } = this.state;

    return (
      <Form onSubmit={this.sendMessage} style={{ display: 'flex', justifyContent: 'space-around' }}>
        <Input
          style={{ width: '70%' }}
          placeholder="Escribir un mensaje..."
          value={content}
          onChange={({ target: { value } }) => this.setContent(value)}
        />
        <Button
          style={{ width: '20%' }}
          disabled={!content.trim()}
          type="primary"
          htmlType="submit"
          icon="arrow-right"
          loading={loading}
          onClick={this.sendMessage}
        >
          {(loading && 'Espere..') || 'Enviar'}
        </Button>
      </Form>
    );
  }
}

export default withApollo(MessageForm);
