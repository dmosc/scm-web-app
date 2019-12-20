import React, {Component} from 'react';
import {Form} from 'antd';
import Layout from 'components/layout/admin';
import Container from 'components/common/container';
import ClientForm from './components/client-form';
import TruckForm from './components/truck-form';

class DashboardRegistry extends Component {
  state = {};
  render() {
    const {user, collapsed, onCollapse} = this.props;

    const ClientRegisterForm = Form.create({name: 'client'})(ClientForm);
    const TruckRegisterForm = Form.create({name: 'truck'})(TruckForm);

    return (
      <Layout
        user={user}
        collapsed={collapsed}
        onCollapse={onCollapse}
        page="Registros"
      >
        <Container width="50%" alignitems="center">
          <ClientRegisterForm />
        </Container>
        <Container width="50%" alignitems="center">
          <TruckRegisterForm />
        </Container>
      </Layout>
    );
  }
}

export default DashboardRegistry;
