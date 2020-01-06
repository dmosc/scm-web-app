import React, {Component} from 'react';
import {Form, Carousel} from 'antd';
import Layout from 'components/layout/admin';
import Container from 'components/common/container';
import ClientForm from './components/client-form';
import TruckForm from './components/truck-form';
import UserForm from './components/user-form';
import ProductForm from './components/product-form';

class DashboardRegistry extends Component {
  state = {};
  render() {
    const {user, collapsed, onCollapse} = this.props;

    const ClientRegisterForm = Form.create({name: 'client'})(ClientForm);
    const TruckRegisterForm = Form.create({name: 'truck'})(TruckForm);
    const UserRegisterForm = Form.create({name: 'user'})(UserForm);
    const ProductEditForm = Form.create({name: 'user'})(ProductForm);

    return (
      <Layout
        user={user}
        collapsed={collapsed}
        onCollapse={onCollapse}
        page="Registros"
      >
        <Container
          background="transparent"
          height="fit-content"
          justify="center"
          alignitems="center"
        >
          <Carousel
            style={{backgroundColor: '#1890ff', borderRadius: 5}}
            dotPosition="top"
          >
            <Container width="95%" display="flex" justify="center">
              <Container width="50%">
                <ClientRegisterForm />
              </Container>
              <Container width="50%">
                <TruckRegisterForm />
              </Container>
            </Container>
            <Container width="95%" display="flex" justify="center">
              <Container width="50%">
                <UserRegisterForm />
              </Container>
              <Container title="Editar precio de producto">
                <ProductEditForm />
              </Container>
            </Container>
          </Carousel>
        </Container>
      </Layout>
    );
  }
}

export default DashboardRegistry;
