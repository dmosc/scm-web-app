import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { withApollo } from 'react-apollo';
import Webcam from 'react-webcam';
import { Form, Row, Col, Button, Input, Icon, notification, List } from 'antd';
import {
  FormContainer,
  ImageContainer,
  PreviewImageContainer,
  ProductContainer,
  ProductList,
  HiddenForm
} from './elements';
import { REGISTER_TICKET_INIT } from './graphql/mutations';
import { GET_ROCKS, GET_TRUCK, DECIPHER_PLATES } from './graphql/queries';

const TicketInit = ({ client, user }) => {
  const camRef = React.createRef();
  const [loading, setLoading] = useState(false);
  const [plates, setPlates] = useState(null);
  const [inTruckImage, setInTruckImage] = useState(null);
  const [products, setProducts] = useState([]);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [F10Counter, setF10Counter] = useState(0);

  useEffect(() => {
    const resetAndFocusHiddenInput = () => {
      const hiddenInput = document.getElementById('hidden-input');
      // Always reset value
      hiddenInput.value = '';
      hiddenInput.focus();
      // Reset command list
      setF10Counter(0);
    };

    const keyListener = event => {
      if (event.keyCode === 121) {
        if (F10Counter === 3) {
          resetAndFocusHiddenInput();
        } else setF10Counter(F10Counter + 1);
      } else {
        setF10Counter(0);
      }
    };

    document.addEventListener('keydown', keyListener);

    return () => document.removeEventListener('keydown', keyListener);
  }, [F10Counter, setF10Counter]);

  useEffect(() => {
    const getProducts = async () => {
      const {
        data: { rocks: productsToSet }
      } = await client.query({
        query: GET_ROCKS,
        variables: { filters: {} }
      });
      setProducts(productsToSet);
      setInTruckImage('/static/images/truck_image.png');
    };

    getProducts();
  }, [client]);

  const submitHiddenInput = async event => {
    event.preventDefault();

    const hiddenInput = document.getElementById('hidden-input');
    const cipheredPlates = hiddenInput.value;

    const {
      data: { truckDecipherPlates: decipheredPlates }
    } = await client.query({
      query: DECIPHER_PLATES,
      variables: {
        cipheredPlates
      }
    });

    setPlates(decipheredPlates);
  };

  const captureImage = () => {
    const inTruckImageToSet = camRef.current.getScreenshot();

    setInTruckImage(inTruckImageToSet);
  };

  const removeImage = () => setInTruckImage('/static/images/truck_image.png');

  const handleSetCurrentProduct = currentProductToSet => {
    const oldProduct = currentProduct ? { ...currentProduct } : null;

    if (!oldProduct) setCurrentProduct(currentProductToSet);
    else if (currentProduct.id === oldProduct.id) setCurrentProduct(null);
    else setCurrentProduct(currentProductToSet);
  };

  const handleSetPlates = platesToSet => {
    setPlates(platesToSet.replace(/[^0-9a-z]/gi, '').toUpperCase());
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);

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
            id: user.id
          }
        }
      });

      if (errors) {
        notification.open({
          message: errors[0].message
        });
        setLoading(false);
        return;
      }

      setLoading(false);
      setPlates(null);
      setInTruckImage('/static/images/truck_image.png');
      setCurrentProduct(null);

      notification.open({
        message: `Camión ${data.ticketInit.truck.plates} puede ingresar!`
      });
    } else {
      notification.open({
        message: '¡Es necesario completar todos los datos!'
      });

      setLoading(false);
    }
  };

  return (
    <FormContainer>
      <Form onSubmit={handleSubmit}>
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
                      ref={camRef}
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
                    <Button style={{ marginRight: 5 }} type="default" onClick={captureImage}>
                      Capturar
                    </Button>
                    <Button
                      style={{ marginRight: 5 }}
                      type="danger"
                      disabled={!inTruckImage}
                      onClick={removeImage}
                    >
                      Cancelar
                    </Button>
                    <Button
                      style={{ marginRight: 5 }}
                      type="primary"
                      disabled={!inTruckImage}
                      onClick={handleSubmit}
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
                    onChange={({ target: { value } }) => handleSetPlates(value)}
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
                          onClick={() => handleSetCurrentProduct(product)}
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
      <HiddenForm onSubmit={submitHiddenInput}>
        <input id="hidden-input" />
      </HiddenForm>
    </FormContainer>
  );
};

TicketInit.propTypes = {
  client: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired
};

export default withApollo(TicketInit);
