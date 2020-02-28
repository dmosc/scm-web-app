import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withApollo } from 'react-apollo';
import Webcam from 'react-webcam';
import { Form, Row, Col, Button, Input, Icon, notification, List } from 'antd';
import {
  FormContainer,
  ImageContainer,
  PreviewImageContainer,
  ProductContainer,
  ProductList
} from './elements';
import { REGISTER_TICKET_INIT } from './graphql/mutations';
import { GET_ROCKS, GET_TRUCK } from './graphql/queries';

class TicketInit extends Component {
  constructor(props) {
    super(props);
    this.camRef = React.createRef();
    this.state = {
      loading: false,
      plates: null,
      inTruckImage: null,
      products: [],
      currentProduct: null
    };
  }

  componentDidMount = async () => {
    const { client } = this.props;

    const {
      data: { rocks: products }
    } = await client.query({
      query: GET_ROCKS,
      variables: { filters: {} }
    });

    this.setState({ products, inTruckImage: '/static/images/truck_image.png' });
  };

  handleSubmit = async e => {
    const {
      user: { id },
      client
    } = this.props;
    const { plates, inTruckImage, currentProduct } = this.state;

    e.preventDefault();
    this.setState({ loading: true });

    if (plates && inTruckImage && currentProduct) {
      const {
        data: { truck }
      } = await client.query({
        query: GET_TRUCK,
        variables: { plates }
      });

      if (!truck) throw new Error('Camión tiene que pasar a registrarse primero!');

      const { data, errors } = await client.mutate({
        mutation: REGISTER_TICKET_INIT,
        variables: {
          ticket: {
            plates,
            product: currentProduct?.id,
            inTruckImage,
            folderKey: 'trucks',
            id
          }
        }
      });

      if (errors) {
        notification.open({
          message: errors[0].message
        });
        this.setState({ loading: false });
        return;
      }

      this.setState({
        loading: false,
        plates: null,
        inTruckImage: '/static/images/truck_image.png',
        currentProduct: null
      });

      notification.open({
        message: `Camión ${data.ticketInit.truck.plates} puede ingresar!`
      });
    } else {
      notification.open({
        message: '¡Es necesario completar todos los datos!'
      });

      this.setState({ loading: false });
    }
  };

  captureImage = () => {
    const inTruckImage = this.camRef.current.getScreenshot();

    this.setState({ inTruckImage });
  };

  removeImage = () => this.setState({ inTruckImage: '/static/images/truck_image.png' });

  setCurrentProduct = currentProduct => {
    const { currentProduct: oldProduct } = this.state;

    if (!oldProduct) {
      this.setState({ currentProduct });
    } else if (currentProduct.id === oldProduct.id) this.setState({ currentProduct: null });
    else this.setState({ currentProduct });
  };

  setPlates = plates => {
    this.setState({ plates: plates.replace(/[^0-9a-z]/gi, '').toUpperCase() });
  };

  render() {
    const { loading, plates, inTruckImage, products, currentProduct } = this.state;

    return (
      <FormContainer>
        <Form onSubmit={this.handleSubmit}>
          <Form.Item>
            <>
              <Row display="flex" justify="start">
                <Col span={14}>
                  <Row>
                    <Col span={24}>
                      <Webcam
                        style={{
                          height: '15vw',
                          width: '20vw',
                          margin: 0,
                          padding: 0,
                          borderRadius: 5
                        }}
                        ref={this.camRef}
                        screenshotQuality={1}
                        audio={false}
                        imageSmoothing={true}
                      />
                    </Col>
                    <Col span={24}>
                      {!inTruckImage ? (
                        <PreviewImageContainer>
                          <Icon style={{ fontSize: 30 }} type="file-image" />
                        </PreviewImageContainer>
                      ) : (
                        <ImageContainer alt="Preview" src={inTruckImage} />
                      )}
                      <Button style={{ marginRight: 5 }} type="default" onClick={this.captureImage}>
                        Capturar
                      </Button>
                      <Button
                        style={{ marginRight: 5 }}
                        type="danger"
                        disabled={!inTruckImage}
                        onClick={this.removeImage}
                      >
                        Cancelar
                      </Button>
                      <Button
                        style={{ marginRight: 5 }}
                        type="primary"
                        disabled={!inTruckImage}
                        onClick={this.handleSubmit}
                        loading={loading}
                      >
                        {(loading && 'Espere..') || 'OK'}
                      </Button>
                    </Col>
                  </Row>
                </Col>
                <Col span={10}>
                  <Form.Item label="Placas">
                    <Input
                      prefix={<Icon type="number" style={{ color: 'rgba(0,0,0,.25)' }} />}
                      value={plates || ''}
                      placeholder="Placas"
                      onChange={({ target: { value } }) => this.setPlates(value)}
                    />
                  </Form.Item>
                  <Form.Item label="Producto">
                    <ProductList
                      size="small"
                      dataSource={products}
                      renderItem={product => (
                        <List.Item>
                          <ProductContainer
                            color={
                              product.id === currentProduct?.id || !currentProduct
                                ? product.color
                                : '#D9D9D9'
                            }
                            onClick={() => this.setCurrentProduct(product)}
                          >
                            {product.name}
                          </ProductContainer>
                        </List.Item>
                      )}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </>
          </Form.Item>
        </Form>
      </FormContainer>
    );
  }
}

TicketInit.propTypes = {
  client: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired
};

export default withApollo(TicketInit);
