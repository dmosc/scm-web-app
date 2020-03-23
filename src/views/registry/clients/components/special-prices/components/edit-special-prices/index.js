import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { withApollo } from 'react-apollo';
import { Button, Divider, InputNumber, List, message, Modal, Select, Tag, Typography } from 'antd';
import { NewPriceForm } from './elements';
import { ADD_SPECIAL_PRICE } from './graphql/mutations';
import { GET_ROCKS, GET_SPECIAL_PRICES } from './graphql/queries';

const { Option } = Select;
const { Item } = List;
const { Text } = Typography;
const { confirm } = Modal;

const EditSpecialPrices = ({ client, currentClient }) => {
  const [loading, setLoading] = useState(true);
  const [specialPrices, setSpecialPrices] = useState([]);
  const [rocks, setRocks] = useState([]);
  const [mappedRocks, setMappedRocks] = useState({});
  const [rockToAdd, setRockToAdd] = useState({});

  const updateSpecialPrices = () => {
    const getSpecialPrices = async () => {
      const {
        data: { clientPricesByClient }
      } = await client.query({
        query: GET_SPECIAL_PRICES,
        variables: {
          client: currentClient.id
        }
      });

      setLoading(false);
      setSpecialPrices(clientPricesByClient);
    };

    getSpecialPrices();
  };

  useEffect(updateSpecialPrices, [client, currentClient.id]);

  useEffect(() => {
    const getRocks = async () => {
      const {
        data: { rocks: rocksToSet }
      } = await client.query({
        query: GET_ROCKS,
        variables: { filters: {} }
      });

      const mappedRocksToSet = {};

      rocksToSet.forEach(rock => {
        mappedRocksToSet[rock.id] = rock;
      });

      setMappedRocks(mappedRocksToSet);
      setRocks(rocksToSet);
    };

    getRocks();
  }, [client]);

  const addRock = event => {
    event.preventDefault();

    const { price, rock } = rockToAdd;

    if (!price || !rock) {
      message.warning('Producto y precio son campos requeridos');
      return;
    }

    if (price < mappedRocks[rock].floorPrice) {
      message.warning(
        'Si el precio especial es menor al precio piso, es necesario crear una solicitud'
      );
      return;
    }

    confirm({
      title: '¿Estás seguro de que deseas agregar este precio especial?',
      content: `Una vez agregado quedará activo en los cobros que se apliquen a ${currentClient.businessName}`,
      onOk: async () => {
        const { errors } = await client.mutate({
          mutation: ADD_SPECIAL_PRICE,
          variables: {
            clientPrice: {
              client: currentClient.id,
              rock: rockToAdd.rock,
              price: rockToAdd.price
            }
          }
        });
        if (errors) {
          message.error(errors[0].message);
          return;
        }
        setRockToAdd({});
        updateSpecialPrices();
      },
      onCancel: () => {}
    });
  };

  const deleteRock = rock => {
    confirm({
      title: '¿Estás seguro de que deseas retirar este precio especial?',
      content: `Una vez retirado, dejará de aplicar en los cobros de ${currentClient.businessName}`,
      onOk: async () => {
        const { errors } = await client.mutate({
          mutation: ADD_SPECIAL_PRICE,
          variables: {
            clientPrice: {
              client: currentClient.id,
              rock,
              price: -1,
              noSpecialPrice: true
            }
          }
        });
        if (errors) {
          message.error(errors[0].message);
          return;
        }
        setRockToAdd({});
        updateSpecialPrices();
      },
      onCancel: () => {}
    });
  };

  return (
    <>
      <Divider orientation="left">Añade las piedras y sus precios especiales</Divider>
      <NewPriceForm onSubmit={addRock}>
        <Select
          value={rockToAdd.rock}
          onChange={rock => setRockToAdd({ ...rockToAdd, rock })}
          allowClear
          style={{ flexBasis: '60%', width: '100%', marginRight: 5 }}
          placeholder="Piedras disponibles"
        >
          {rocks.map(({ id, name, price, floorPrice }) => (
            <Option key={id} value={id} style={{ display: 'flex' }}>
              <Text style={{ marginRight: 'auto' }}>{name}</Text>
              <Tag color="green">General: {price}MXN</Tag>
              <Tag color="orange">Piso: {floorPrice}MXN</Tag>
            </Option>
          ))}
        </Select>
        <InputNumber
          value={rockToAdd.price}
          onChange={price => setRockToAdd({ ...rockToAdd, price })}
          required
          style={{ flexBasis: '30%', width: '100%', marginRight: 5 }}
          placeholder="MXN / Ton"
          min={0}
          step={0.01}
        />
        <Button
          style={{ flexBasis: '10%', width: '100%' }}
          type="primary"
          icon="plus"
          onClick={addRock}
        >
          Añadir
        </Button>
      </NewPriceForm>
      <List
        style={{ marginTop: 10 }}
        bordered
        loading={loading}
        dataSource={specialPrices}
        renderItem={({ rock, price }) => (
          <Item>
            <Text>{rock.name}</Text>
            <div>
              <Tag color="blue">Precio especial: ${price}MXN</Tag>
              <Button
                onClick={() => deleteRock(rock.id)}
                type="danger"
                icon="delete"
                size="small"
              />
            </div>
          </Item>
        )}
      />
    </>
  );
};

EditSpecialPrices.propTypes = {
  client: PropTypes.object.isRequired,
  currentClient: PropTypes.object.isRequired
};

export default withApollo(EditSpecialPrices);
