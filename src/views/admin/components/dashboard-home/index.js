import React, { Component } from 'react';
import Layout from 'components/layout/admin';
import Container from 'components/common/container';
import PostsList from './components/posts-list';

class DashboardHome extends Component {
  state = {};
  render() {
    const { user, collapsed, onCollapse } = this.props;
    return (
      <Layout user={user} collapsed={collapsed} onCollapse={onCollapse} page="Dashboard">
        <Container title="Posts recientes" width="30%">
          <PostsList />
        </Container>
      </Layout>
    );
  }
}

export default DashboardHome;
