import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { withApollo } from 'react-apollo';
import { Button, Form, Icon, Input, List, message, Modal, notification } from 'antd';
import {
  FormContainer,
  HiddenForm,
  ProductContainer,
  ProductList,
  TruckContainer,
  TruckList
} from './elements';
import { REGISTER_TICKET_INIT } from './graphql/mutations';
import { DECIPHER_PLATES, GET_ROCKS, GET_SIMILAR_TRUCKS } from './graphql/queries';
import InPhotoCapturer from './components/in-photo-capturer';

const defaultImages = {
  left: '',
  top: '',
  right: ''
};

const TicketInit = ({ client, user }) => {
  const [loading, setLoading] = useState(false);
  const [showCapturer, toggleCapturer] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [trucks, setTrucks] = useState([]);
  const [ticketClient, setTicketClient] = useState(null);
  const [plates, setPlates] = useState(null);
  const [inTruckImages, setInTruckImages] = useState(defaultImages);
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
      if (event.keyCode === 123) {
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
      setInTruckImages({
        right: '',
        top: '/static/images/truck_image.png',
        left: ''
      });
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

  const handleSetCurrentProduct = currentProductToSet => {
    const oldProduct = currentProduct ? { ...currentProduct } : null;

    if (!oldProduct) setCurrentProduct(currentProductToSet);
    else if (currentProduct.id === oldProduct.id) setCurrentProduct(null);
    else setCurrentProduct(currentProductToSet);
  };

  const handleSetPlates = platesToSet => {
    setPlates(platesToSet.replace(/[^0-9a-z]/gi, '').toUpperCase());
  };

  const initializeTicket = async clientId => {
    const { data, errors } = await client.mutate({
      mutation: REGISTER_TICKET_INIT,
      variables: {
        ticket: {
          client: ticketClient ? ticketClient : clientId,
          plates,
          product: currentProduct?.id,
          inTruckImageRight: inTruckImages.right,
          inTruckImage: inTruckImages.top,
          inTruckImageLeft: inTruckImages.left,
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
    setShowModal(false);
    setPlates(null);
    setInTruckImages(defaultImages);
    setCurrentProduct(null);

    notification.open({
      message: `Camión ${data?.ticketInit.truck.plates} puede ingresar!`
    });
  };

  const cancelTicket = () => {
    setLoading(false);
    setShowModal(false);
  };

  const handleSubmit = async e => {
    e.preventDefault();

    toggleCapturer(false);

    if (!inTruckImages.top) {
      message.error('Es necesaria almenos la imagen superior del camión');
      return;
    }

    if (!currentProduct) {
      message.error('Es necesario seleccionar el producto');
      return;
    }

    if (plates && inTruckImages.top && currentProduct) {
      setLoading(true);
      const {
        data: { similarTrucks }
      } = await client.query({
        query: GET_SIMILAR_TRUCKS,
        variables: { plates }
      });

      if (similarTrucks.length === 0) {
        message.error('El camión no está identificado y tiene que pasar a registrarse primero');
      } else if (similarTrucks.length === 1) {
        await initializeTicket(similarTrucks[0]?.client.id);
      } else {
        setTicketClient(similarTrucks[0]?.client.id);
        setTrucks(similarTrucks);
        setShowModal(true);
        return;
      }

      setLoading(false);
    } else {
      message.warning('¡Es necesario completar todos los datos!');

      setLoading(false);
    }
  };

  return (
    <FormContainer>
      <Form>
        <Form.Item>
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
          <Button
            style={{ width: '100%' }}
            type="primary"
            disabled={!plates || !currentProduct}
            onClick={() => toggleCapturer(true)}
            loading={loading}
          >
            Entrar
          </Button>
        </Form.Item>
      </Form>
      <InPhotoCapturer
        inTruckImages={inTruckImages}
        setInTruckImages={setInTruckImages}
        visible={showCapturer}
        onCancel={() => toggleCapturer(false)}
        handleSubmit={handleSubmit}
      />
      <HiddenForm onSubmit={submitHiddenInput}>
        <input id="hidden-input" />
      </HiddenForm>
      <Modal
        title="Seleccione un cliente"
        visible={showModal}
        onOk={initializeTicket}
        onCancel={cancelTicket}
      >
        <TruckList
          size="small"
          dataSource={trucks}
          renderItem={truck => (
            <List.Item style={{ border: 'none' }}>
              <TruckContainer
                color={truck.client.id === ticketClient ? '#1890FF' : undefined}
                onClick={() => setTicketClient(truck.client.id)}
              >
                {truck.client.businessName}
              </TruckContainer>
            </List.Item>
          )}
        />
      </Modal>
    </FormContainer>
  );
};

TicketInit.propTypes = {
  client: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired
};

export default withApollo(TicketInit);
