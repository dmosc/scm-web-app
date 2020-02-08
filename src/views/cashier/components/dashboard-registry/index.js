import React from 'react';
import { Form, Row, Col } from 'antd';
import Layout from 'components/layout/cashier';
import Container from 'components/common/container';
import ClientForm from './components/client-form';
import TruckForm from './components/truck-form';

const DashboardRegistry = ({ user, collapsed, onCollapse }) => {
  const ClientRegisterForm = Form.create({ name: 'client' })(ClientForm);
  const TruckRegisterForm = Form.create({ name: 'truck' })(TruckForm);
  return (
    <Layout user={user} collapsed={collapsed} onCollapse={onCollapse} page="Registros">
      <Container justifycontent="center">
        <Row gutter={{ xs: 8, sm: 16, md: 24 }}>
          <Col span={12}>
            <Container width="90%" height="55vh">
              <ClientRegisterForm />
            </Container>
          </Col>
          <Col span={12}>
            <Container width="90%" height="55vh">
              <TruckRegisterForm />
            </Container>
          </Col>
        </Row>
      </Container>
    </Layout>
  );
};

export default DashboardRegistry;
