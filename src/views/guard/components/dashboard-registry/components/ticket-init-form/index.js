import React, {Component} from 'react';
import {withApollo} from 'react-apollo';
import Webcam from 'react-webcam';
import {Form, Row, Col, Button, Select, Input, Icon, notification, List} from 'antd';
import ListContainer from "components/common/list";
import {FormContainer, ImageContainer, PreviewImageContainer, ProductContainer} from './elements';
import {REGISTER_TICKET_INIT, FILE_UPLOAD} from './graphql/mutations';
import {GET_ROCKS, GET_TRUCK} from './graphql/queries';

const {Option} = Select;

class TicketInit extends Component {
  state = {
    loading: false,
    inTruckImage: null,
    products: [],
    currentProduct: null
  };

  componentDidMount = async () => {
    const {client} = this.props;

    const {
      data: {rocks: products},
    } = await client.query({
      query: GET_ROCKS,
      variables: {filters: {}},
    });

    this.setState({products});
  };

  handleSubmit = e => {
    const {
      form,
      user: {id},
      client,
    } = this.props;
    const {currentProduct} = this.state;


    e.preventDefault();
    this.setState({loading: true});

    form.validateFields(async (err, {plates}) => {
      if (!err && currentProduct) {
        const {inTruckImage: image} = this.state;

        try {
          const {
            data: {truck},
          } = await client.query({
            query: GET_TRUCK,
            variables: {plates},
          });

          if (!truck)
            throw new Error('Camión tiene que pasar a registrarse primero!');

          const {
            data: {imageUpload: inTruckImage},
          } = await client.mutate({
            mutation: FILE_UPLOAD,
            variables: {image, folderKey: 'trucks', id},
          });

          if (!inTruckImage) {
            notification.open({
              message: `No ha sido posible guardar la imagen correctamente!`,
            });

            throw new Error('No ha sido posible guardar la imagen!');
          } else {
            notification.open({
              message: `¡La imagen ha sido subida exitosamente!`,
            });
          }

          const {
            data: {ticketInit: ticket},
          } = await client.mutate({
            mutation: REGISTER_TICKET_INIT,
            variables: {ticket: {plates, product: currentProduct?.id, inTruckImage}},
          });

          this.setState({loading: false, inTruckImage: null, currentProduct: null});

          notification.open({
            message: `Camión ${ticket.truck.plates} puede ingresar!`,
          });

          form.resetFields();
        } catch (e) {
          if (e['graphQLErrors']) {
            e['graphQLErrors'].map(({message}) =>
              notification.open({
                message,
              })
            );
          }

          this.setState({loading: false});
        }
      } else {
        notification.open({
          message: `¡Es necesario completar todos los datos!`,
        });

        this.setState({loading: false});
      }
    });
  };

  captureImage = () => {
    const {webcamRef} = this.refs;
    const inTruckImage = webcamRef.getScreenshot();

    this.setState({inTruckImage});
  };

  removeImage = () => this.setState({inTruckImage: null});

  setCurrentProduct = currentProduct => {
    const {currentProduct: oldProduct} = this.state;

    if(!oldProduct) {
      this.setState({currentProduct});
    } else {
      if(currentProduct.id === oldProduct.id) this.setState({currentProduct: null});
      else this.setState({currentProduct});
    }
  };

  render() {
    const {form} = this.props;
    const {loading, inTruckImage, products, currentProduct} = this.state;

    console.log(currentProduct);

    return (
      <FormContainer>
        <Form onSubmit={this.handleSubmit}>
          <Form.Item>
            <React.Fragment>
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
                            borderRadius: 5,
                          }}
                          ref="webcamRef"
                          screenshotQuality={1}
                          audio={false}
                          imageSmoothing={true}
                      />
                    </Col>
                    <Col span={24}>
                      {!inTruckImage ? (
                          <PreviewImageContainer>
                            <Icon style={{fontSize: 30}} type="file-image" />
                          </PreviewImageContainer>
                      ) : (
                          <ImageContainer alt="Preview" src={inTruckImage} />
                      )}
                    </Col>
                  </Row>
                </Col>
                <Col span={10}>
                  <Form.Item label="Placas">
                    {form.getFieldDecorator('plates', {
                      rules: [
                        {
                          required: true,
                          message: 'Las placas del camión son requeridas!',
                        },
                      ],
                    })(
                      <Input
                        prefix={
                          <Icon
                            type="number"
                            style={{color: 'rgba(0,0,0,.25)'}}
                          />
                        }
                        placeholder="Placas"
                      />
                    )}
                  </Form.Item>
                  <Form.Item label="Producto">
                    <ListContainer height="40vh">
                      <List
                          size="small"
                          dataSource={products}
                          renderItem={product =>
                              <List.Item>
                                <ProductContainer
                                    color={product.id === currentProduct?.id || !currentProduct ? product.color : '#D9D9D9'}
                                    onClick={() => this.setCurrentProduct(product)}
                                >
                                  {product.name}
                                </ProductContainer>
                              </List.Item>
                          }
                      />
                    </ListContainer>
                  </Form.Item>
                  <Button style={{marginRight: 5}} type="default" onClick={this.captureImage}>
                    Capturar
                  </Button>
                  <Button
                      style={{marginRight: 5}}
                      type="danger"
                      disabled={!inTruckImage}
                      onClick={this.removeImage}
                  >
                    Cancelar
                  </Button>
                  <Button
                      style={{marginRight: 5}}
                      type="primary"
                      disabled={!inTruckImage}
                      onClick={this.handleSubmit}
                      loading={loading}
                  >
                    {(loading && 'Espere..') || 'OK'}
                  </Button>
                </Col>
              </Row>
            </React.Fragment>
          </Form.Item>
        </Form>
      </FormContainer>
    );
  }
}

export default withApollo(TicketInit);
