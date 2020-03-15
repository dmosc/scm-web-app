import React, { useState, useEffect } from 'react';
import { Modal, Select, InputNumber, message, Form, Button, Row, Typography, Tag } from 'antd';
import { withApollo } from 'react-apollo';
import PropTypes from 'prop-types';
import { GET_ROCKS } from './graphql/queries';
import { ADD_PRICE_REQUEST } from './graphql/mutations';

const { Option } = Select;
const { Text } = Typography;

const NewPriceRequestModal = ({ client, visible, toggleNewRequestModal, updateFather }) => {
  const [loadingRocks, setLoadingRocks] = useState(true);
  const [rocks, setRocks] = useState([]);
  const [showPrice, setShowPrice] = useState(false);
  const [showFloorPrice, setShowFloorPrice] = useState(false);
  const [pricesError, setPricesError] = useState(false);
  const [currentRock, setCurrentRock] = useState(null);
  const [newPriceForm, setNewPriceForm] = useState({
    rock: undefined,
    priceRequested: undefined,
    floorPriceRequested: undefined
  });

  useEffect(() => {
    const getRocks = async () => {
      const {
        data: { rocks: rocksToSet }
      } = await client.query({
        query: GET_ROCKS,
        variables: { filters: {} }
      });

      setLoadingRocks(false);
      setRocks(rocksToSet);
    };

    getRocks();
  }, [client]);

  useEffect(() => {
    // If both price and floor price are requested, validate them
    if (
      newPriceForm.priceRequested &&
      newPriceForm.floorPriceRequested &&
      newPriceForm.priceRequested < newPriceForm.floorPriceRequested
    ) {
      setPricesError(true);
      // If at least one of them is included, validate agains current rock
    } else if (
      (newPriceForm.floorPriceRequested && newPriceForm.floorPriceRequested > currentRock.price) ||
      (newPriceForm.priceRequested && newPriceForm.priceRequested < currentRock.floorPrice)
    ) {
      setPricesError(true);
    } else {
      setPricesError(false);
    }
  }, [newPriceForm, showPrice, showFloorPrice, currentRock]);

  useEffect(() => {
    if (!newPriceForm.rock) {
      setCurrentRock(null);
    } else {
      setCurrentRock(rocks.find(({ id }) => id === newPriceForm.rock));
    }
  }, [newPriceForm.rock, rocks]);

  const handleOk = async event => {
    if (event) {
      event.preventDefault();
    }
    const { floorPriceRequested, priceRequested } = newPriceForm;

    if (pricesError) {
      message.error('El precio general debe ser siempre mayor o igual al precio piso');
      return;
    }

    if (!newPriceForm.rock) {
      message.warning('Debes añadir el producto al que se va a aplicar el precio');
      return;
    }

    if (!floorPriceRequested && !priceRequested) {
      message.warning('Debes solicitar almenos un tipo de precio, sea piso o regular');
      return;
    }

    if (floorPriceRequested <= 0 || priceRequested <= 0) {
      message.warning('Los precios solicitados no pueden ser menores a 0');
      return;
    }

    await client.mutate({
      mutation: ADD_PRICE_REQUEST,
      variables: {
        rockPriceRequest: {
          rock: newPriceForm.rock,
          priceRequested: newPriceForm.priceRequested || currentRock.price,
          floorPriceRequested: newPriceForm.floorPriceRequested || currentRock.floorPrice
        }
      }
    });

    toggleNewRequestModal(false);

    message.success('Solicitud creada correctamente');

    updateFather();
  };

  return (
    <Modal
      title="Crear solicitud de precio"
      visible={visible}
      onOk={handleOk}
      onCancel={() => toggleNewRequestModal(false)}
    >
      <Form onSubmit={handleOk}>
        <Form.Item label="Producto">
          <Select
            required
            placeholder="Producto"
            value={newPriceForm.rock}
            onChange={rock => setNewPriceForm({ ...newPriceForm, rock })}
            style={{ width: '100%' }}
            loading={loadingRocks}
          >
            {rocks.map(({ id, name }) => (
              <Option key={id} value={id}>
                {name}
              </Option>
            ))}
          </Select>
        </Form.Item>
        {currentRock && (
          <>
            {showPrice ? (
              <Row style={{ display: 'flex', alignItems: 'center' }}>
                <Text style={{ marginRight: 'auto', marginBottom: 24 }}>Precio:</Text>
                <Form.Item
                  style={{ display: 'flex' }}
                  extra={pricesError ? 'El precio piso debe ser mayor al precio' : ''}
                  validateStatus={pricesError ? 'error' : ''}
                >
                  <InputNumber
                    required
                    placeholder="Precio solicitado"
                    value={newPriceForm.priceRequested}
                    onChange={priceRequested =>
                      setNewPriceForm({ ...newPriceForm, priceRequested })
                    }
                    style={{ width: 'max-content', flexGrow: 1, marginRight: 10 }}
                    min={1}
                    step={0.01}
                  />
                  <Button
                    onClick={() => {
                      // Reset price requested, so it is not included in mutation
                      setNewPriceForm({ ...newPriceForm, priceRequested: undefined });
                      setShowPrice(false);
                    }}
                    type="danger"
                    icon="close"
                  />
                </Form.Item>
              </Row>
            ) : (
              <Row style={{ display: 'flex', marginBottom: 24, alignItems: 'center' }}>
                <Text style={{ marginRight: 'auto' }}>Precio general actual:</Text>
                <Tag color="blue">${currentRock.price}MXN</Tag>
                <Button
                  onClick={() => setShowPrice(true)}
                  style={{ flexBasis: '10%', width: '100%' }}
                  icon="plus"
                >
                  Solicitar nuevo
                </Button>
              </Row>
            )}
            {showFloorPrice ? (
              <Row style={{ display: 'flex', alignItems: 'center' }}>
                <Text style={{ marginRight: 'auto', marginBottom: 24 }}>Precio piso:</Text>
                <Form.Item
                  style={{ display: 'flex' }}
                  extra={pricesError ? 'El precio piso debe ser mayor al precio' : ''}
                  validateStatus={pricesError ? 'error' : ''}
                >
                  <InputNumber
                    required
                    placeholder="Precio piso solicitado"
                    value={newPriceForm.floorPriceRequested}
                    onChange={floorPriceRequested =>
                      setNewPriceForm({ ...newPriceForm, floorPriceRequested })
                    }
                    style={{ width: 'max-content', flexGrow: 1, marginRight: 10 }}
                    min={1}
                    step={0.01}
                  />
                  <Button
                    onClick={() => {
                      // Reset price floor requested, so it is not included in mutation
                      setNewPriceForm({ ...newPriceForm, floorPriceRequested: undefined });
                      setShowFloorPrice(false);
                    }}
                    type="danger"
                    icon="close"
                  />
                </Form.Item>
              </Row>
            ) : (
              <Row style={{ display: 'flex', marginBottom: 24, alignItems: 'center' }}>
                <Text style={{ marginRight: 'auto' }}>Precio piso actual:</Text>
                <Tag color="blue">${currentRock.floorPrice}MXN</Tag>
                <Button onClick={() => setShowFloorPrice(true)} icon="plus">
                  Solicitar nuevo
                </Button>
              </Row>
            )}
          </>
        )}
      </Form>
    </Modal>
  );
};

NewPriceRequestModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  toggleNewRequestModal: PropTypes.func.isRequired,
  updateFather: PropTypes.func.isRequired,
  client: PropTypes.object.isRequired
};

export default withApollo(NewPriceRequestModal);
