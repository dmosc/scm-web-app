import React, {Component} from 'react';
import Layout from 'components/layout/admin';
import Container from 'components/common/container';
import TicketsList from "./components/tickets-list";

class DashboardHistory extends Component {
  state = {};
  render() {
    const {user, collapsed, onCollapse} = this.props;
    return (
      <Layout
        user={user}
        collapsed={collapsed}
        onCollapse={onCollapse}
        page="Historial"
      >
        <Container display="flex" justifycontent="center" alignitems="center">
          <TicketsList />
        </Container>
      </Layout>
    );
  }
}

export default DashboardHistory;
