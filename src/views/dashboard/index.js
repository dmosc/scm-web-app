import React from 'react';
import { Col, Row } from 'antd';
import Container from 'components/common/container';
import PostsList from './components/posts-list';
import SalesSummary from './components/sales-summary';
import NewClients from './components/new-clients';
import ProductsSummary from './components/products-summary';
import Goals from './components/goals';

const Dashboard = () => (
  <>
    <Row gutter={[0, 0]}>
      <Col span={8}>
        <Container title="Posts recientes">
          <PostsList />
        </Container>
      </Col>
      <Col span={8}>
        <Row gutter={[0, 0]}>
          <Col span={20}>
            <Container title="Resumen de ventas" width="100%">
              <SalesSummary />
            </Container>
          </Col>
        </Row>
        <Row gutter={[0, 0]}>
          <Col span={20}>
            <Container title="Metas" width="100%">
              <Goals />
            </Container>
          </Col>
        </Row>
      </Col>
      <Col span={8}>
        <Row>
          <Col span={20}>
            <Container title="Resumen de productos" width="100%">
              <ProductsSummary />
            </Container>
          </Col>
        </Row>
        <Row>
          <Col span={20}>
            <Container title="Nuevos clientes" width="100%">
              <NewClients />
            </Container>
          </Col>
        </Row>
      </Col>
    </Row>
  </>
);

export default Dashboard;
