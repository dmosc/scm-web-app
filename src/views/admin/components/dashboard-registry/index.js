import React, {Component} from 'react';
import {Form, Row, Col} from 'antd';
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
        <Row gutter={{xs: 8, sm: 16, md: 24}}>
          <Col span={12}>
            <Container
              width="50vh"
              title="Registrar cliente"
              alignitems="center"
            >
              <ClientRegisterForm />
            </Container>
          </Col>
          <Col span={12}>
            <Container
              width="50vh"
              title="Registrar camión"
              alignitems="center"
            >
              <TruckRegisterForm />
            </Container>
          </Col>
        </Row>
      </Layout>
    );
  }
}

export default DashboardRegistry;
