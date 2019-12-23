import React, {Component} from 'react';
import {Form} from 'antd';
import Layout from 'components/layout/guard';
import Container from 'components/common/container';
import TicketInit from './components/ticket-init-form';
import TrucksList from './components/trucks-list';

class DashboardRegistry extends Component {
  render() {
    const {user, collapsed, onCollapse} = this.props;

    const TicketInitForm = Form.create({name: 'truck'})(TicketInit);

    return (
      <Layout
        user={user}
        collapsed={collapsed}
        onCollapse={onCollapse}
        page="Registros"
      >
        <Container title="Ingreso de camión" width="50%">
          <TicketInitForm user={user} />
        </Container>
        <Container title="Camiones activos" width="50%">
          <TrucksList />
        </Container>
      </Layout>
    );
  }
}

export default DashboardRegistry;
