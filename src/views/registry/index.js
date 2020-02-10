import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Form, Row, Col, Radio } from 'antd';
import { withAuth } from 'components/providers/withAuth';
import Container from 'components/common/container';
import ClientForm from './components/client-form';
import TruckForm from './components/truck-form';
import UserForm from './components/user-form';
import ProductForm from './components/product-form';

const { Group, Button } = Radio;

const Registry = ({ auth: { isAdmin } }) => {
  const [view, setView] = useState(1);

  const ClientRegisterForm = Form.create({ name: 'client' })(ClientForm);
  const TruckRegisterForm = Form.create({ name: 'truck' })(TruckForm);
  const UserRegisterForm = Form.create({ name: 'user' })(UserForm);
  const ProductEditForm = Form.create({ name: 'product' })(ProductForm);

  return (
    <>
      <Container justifycontent="center">
        {isAdmin && (
          <Row gutter={{ xs: 8, sm: 16, md: 24 }}>
            <Col span={24}>
              <Group defaultValue={1} onChange={({ target: { value } }) => setView(value)}>
                <Button value={1}>1</Button>
                <Button value={2}>2</Button>
              </Group>
            </Col>
          </Row>
        )}
        <Row gutter={{ xs: 8, sm: 16, md: 24 }}>
          {view === 1 ? (
            <>
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
            </>
          ) : (
            <>
              <Col span={12}>
                <Container width="90%" height="55vh">
                  <UserRegisterForm />
                </Container>
              </Col>
              <Col span={12}>
                <Container width="90%" height="55vh" title="Editar precio de producto">
                  <ProductEditForm />
                </Container>
              </Col>
            </>
          )}
        </Row>
      </Container>
    </>
  );
};

Registry.propTypes = {
  auth: PropTypes.object.isRequired
};

export default withAuth(Registry);
