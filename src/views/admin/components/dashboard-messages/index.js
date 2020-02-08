import React, { Component } from 'react';
import { Form } from 'antd';
import Layout from 'components/layout/admin';
import Container from 'components/common/container';
import Chat from './components/chat';
import PostForm from './components/post-form';

class DashboardMessages extends Component {
  state = {};

  render() {
    const { user, collapsed, onCollapse } = this.props;

    const PostRegisterForm = Form.create({ name: 'post' })(PostForm);

    return (
      <Layout
        user={user}
        collapsed={collapsed}
        onCollapse={onCollapse}
        page="Mensajes"
        justify="center"
      >
        <Container title="Crear publicación" width="50%" alignitems="center">
          <PostRegisterForm user={user} />
        </Container>
        <Container title="Chat" width="50%" height="70vh" alignitems="center">
          <Chat user={user} />
        </Container>
      </Layout>
    );
  }
}

export default DashboardMessages;
