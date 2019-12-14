import React, {Component} from 'react';
import Layout from 'components/layout/admin';
import Container from 'components/common/container';

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
      >
        <Container display="flex" justifycontent="center" alignitems="center">
          <img
            src="/static/images/section_under_construction.png"
            alt="Under Construction!"
          />
          <h1 style={{fontSize: 40}}>Sección en construcción...</h1>
        </Container>
      </Layout>
    );
  }
}

export default DashboardMessages;
