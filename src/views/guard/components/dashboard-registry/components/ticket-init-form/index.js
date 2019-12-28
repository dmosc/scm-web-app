import React, {Component} from 'react';
import {withApollo} from 'react-apollo';
import {Form, Row, Col, Button, Select, Input, Icon, notification} from 'antd';
import Webcam from 'react-webcam';
import {GET_ROCKS} from './graphql/queries';
import {FormContainer, ImageContainer, PreviewImageContainer} from './elements';
import {REGISTER_TICKET_INIT, FILE_UPLOAD} from './graphql/mutations';
import {GET_TRUCK} from './graphql/queries';

const {Option} = Select;

class TicketInit extends Component {
  state = {
    loading: false,
    inTruckImage: null,
    products: [],
  };

  handleSubmit = e => {
    const {
      form,
      user: {id},
      client,
    } = this.props;

    e.preventDefault();
    this.setState({loading: true});

    form.validateFields(async (err, {plates, product: productInfo}) => {
      if (!err) {
        const {inTruckImage: image} = this.state;
        const product = productInfo.substring(productInfo.indexOf(':') + 1);

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
            variables: {ticket: {plates, product, inTruckImage}},
          });

          this.setState({loading: false, inTruckImage: null});

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

  render() {
    const {form} = this.props;
    const {loading, inTruckImage, products} = this.state;

    return (
      <FormContainer>
        <Form onSubmit={this.handleSubmit}>
          <Form.Item>
            <React.Fragment>
              <Row display="flex" justify="start" gutter={1}>
                <Col span={14}>
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
                    {form.getFieldDecorator('product', {
                      rules: [
                        {
                          required: true,
                          message: 'El tipo de producto es requerido!',
                        },
                      ],
                    })(
                      <Select showSearch placeholder="Seleccione un producto">
                        {products.map(product => (
                          <Option
                            key={product.id}
                            value={`${product.name}:${product.id}`}
                          >
                            {product.name}
                          </Option>
                        ))}
                      </Select>
                    )}
                  </Form.Item>
                  <Button type="default" onClick={this.captureImage}>
                    Capturar
                  </Button>
                </Col>
              </Row>
              <Row type="flex" align="bottom">
                <Col span={14}>
                  {!inTruckImage ? (
                    <PreviewImageContainer>
                      <Icon style={{fontSize: 30}} type="file-image" />
                    </PreviewImageContainer>
                  ) : (
                    <ImageContainer alt="Preview" src={inTruckImage} />
                  )}
                </Col>
                <Col span={10}>
                  {inTruckImage && (
                    <React.Fragment>
                      <Button
                        style={{marginRight: 5}}
                        type="primary"
                        onClick={this.handleSubmit}
                        loading={loading}
                      >
                        {(loading && 'Espere..') || 'OK'}
                      </Button>
                      <Button
                        style={{marginRight: 5}}
                        type="danger"
                        onClick={this.removeImage}
                      >
                        Cancelar
                      </Button>
                    </React.Fragment>
                  )}
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
