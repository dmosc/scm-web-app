import React, {Component} from 'react';
import {Form, Row, Col, Radio} from 'antd';
import Layout from 'components/layout/admin';
import Container from 'components/common/container';
import ClientForm from './components/client-form';
import TruckForm from './components/truck-form';
import UserForm from './components/user-form';
import ProductForm from './components/product-form';

const {Group, Button} = Radio;

class DashboardRegistry extends Component {
  state = {
    view: 1
  };

  toggleView = view => this.setState({view});

  render() {
    const {user, collapsed, onCollapse} = this.props;
    const {view} = this.state;

    const ClientRegisterForm = Form.create({name: 'client'})(ClientForm);
    const TruckRegisterForm = Form.create({name: 'truck'})(TruckForm);
    const UserRegisterForm = Form.create({name: 'user'})(UserForm);
    const ProductEditForm = Form.create({name: 'product'})(ProductForm);

    return (
      <Layout
        user={user}
        collapsed={collapsed}
        onCollapse={onCollapse}
        page="Registros"
      >
        <Container justifycontent="center">
          <Row gutter={{ xs: 8, sm: 16, md: 24}}>
            <Col span={24}>
              <Group defaultValue={1} onChange={({target: {value}}) => this.toggleView(value)}>
                <Button value={1}>1</Button>
                <Button value={2}>2</Button>
              </Group>
            </Col>
          </Row>
          <Row gutter={{ xs: 8, sm: 16, md: 24}}>
            {view === 1 ?
                <React.Fragment>
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
                </React.Fragment> :
                <React.Fragment>
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
                </React.Fragment>
            }
          </Row>
        </Container>
      </Layout>
    );
  }
}

export default DashboardRegistry;
