import React, { Component } from 'react';
import { withApollo } from 'react-apollo';
import { Form, Button, Input, Icon, notification } from 'antd';
import { REGISTER_POST } from './graphql/mutations';

const { TextArea } = Input;

class PostForm extends Component {
  state = {
    loading: false
  };

  handleSubmit = e => {
    const {
      form,
      user: { username },
      client
    } = this.props;

    this.setState({ loading: true });
    e.preventDefault();
    form.validateFields(async (err, { title, content }) => {
      if (!err) {
        try {
          const {
            data: { post }
          } = await client.mutate({
            mutation: REGISTER_POST,
            variables: { post: { username, title, content } }
          });

          notification.open({
            message: post
              ? `Post ${post.title} ha sido publicado exitosamente`
              : `Ha habido un error realizando la publicación`
          });

          form.resetFields();
          this.setState({ loading: false });
        } catch (e) {
          notification.error({
            message: `No se puede realizar la publicación`
          });
        }
        this.setState({ loading: false });
      } else {
        notification.error({
          message: `¡Complete los campos faltantes!`
        });
        this.setState({ loading: false });
      }
    });
  };

  render() {
    const { form } = this.props;
    const { loading } = this.state;

    return (
      <Form onSubmit={this.handleSubmit}>
        <Form.Item>
          {form.getFieldDecorator('title', {
            rules: [{ required: true, message: '¡Un título es necesario!' }]
          })(
            <Input
              prefix={<Icon type="info" style={{ color: 'rgba(0,0,0,.25)' }} />}
              placeholder="Título del post"
            />
          )}
        </Form.Item>
        <Form.Item>
          {form.getFieldDecorator('content', {
            rules: [{ required: true, message: '¡Un título es necesario!' }]
          })(
            <TextArea allowClear placeholder="Contenido..." autoSize={{ minRows: 4, maxRows: 6 }} />
          )}
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" icon="plus" loading={loading}>
            {(loading && 'Espere..') || 'Publicar'}
          </Button>
        </Form.Item>
      </Form>
    );
  }
}

export default withApollo(PostForm);
