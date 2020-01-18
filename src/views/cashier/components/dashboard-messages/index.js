import React, {Component} from 'react';
import Layout from 'components/layout/cashier';
import Container from 'components/common/container';
import Chat from './components/chat';

class DashboardMessages extends Component {
  state = {};
  render() {
    const {user, collapsed, onCollapse} = this.props;

    return (
      <Layout
        user={user}
        collapsed={collapsed}
        onCollapse={onCollapse}
        page="Mensajes"
        justify="center"
      >
        <Container title="Chat" width="80%" height="70vh" alignitems="center">
          <Chat user={user} />
        </Container>
      </Layout>
    );
  }
}

export default DashboardMessages;
