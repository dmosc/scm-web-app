import React, { useState, useEffect } from 'react';
import { Modal, Select, List, Tag, Typography, InputNumber, Button, Divider, message } from 'antd';
import { useDebounce } from 'use-lodash-debounce';
import { withApollo } from 'react-apollo';
import PropTypes from 'prop-types';
import { GET_CLIENTS, GET_ROCKS } from './graphql/queries';
import { ADD_PRICE_REQUEST } from './graphql/mutations';
import { NewPriceForm } from './elements';

const { Option } = Select;
const { Item } = List;
const { Text } = Typography;

const NewPriceRequestModal = ({ client, visible, toggleNewRequestModal, updateFather }) => {
  const [loadingClients, setLoadingClients] = useState(false);
  const [search, setSearch] = useState('');
  const [clients, setClients] = useState([]);
  const [beneficiary, setBeneficiary] = useState();
  const [prices, setPrices] = useState([]);
  const [rocks, setRocks] = useState([]);
  const [filteredRocks, setFilteredRocks] = useState([]);
  const [newPriceForm, setNewPriceForm] = useState({
    currentRockIndex: undefined,
    priceRequested: undefined
  });
  const debouncedSearch = useDebounce(search, 400);

  useEffect(() => {
    const getRocks = async () => {
      const {
        data: { rocks: rocksToSet }
      } = await client.query({
        query: GET_ROCKS,
        variables: { filters: {} }
      });

      setRocks(rocksToSet);
    };

    getRocks();
  }, [client]);

  useEffect(() => {
    // Wicho, forgive me plz
    const filteredRocksToSet = rocks.filter(({ id }) => !prices.some(({ rock }) => rock === id));

    setFilteredRocks(filteredRocksToSet);
  }, [rocks, prices]);

  useEffect(() => {
    const getClients = async () => {
      if (!debouncedSearch) {
        setClients([]);
        setLoadingClients(false);
        return;
      }

      const {
        data: { clients: clientsToSet }
      } = await client.query({
        query: GET_CLIENTS,
        variables: {
          filters: { limit: 10, search: debouncedSearch }
        }
      });

      setLoadingClients(false);
      setClients(clientsToSet);
    };

    getClients();
  }, [client, debouncedSearch]);

  const onSearch = searchToSet => {
    setLoadingClients(!!searchToSet);
    setSearch(searchToSet);
  };

  const addRock = event => {
    event.preventDefault();
    const { currentRockIndex, priceRequested } = newPriceForm;

    if (!priceRequested || typeof currentRockIndex !== 'number') {
      message.error('Completa los campos');
      return;
    }

    if (priceRequested >= filteredRocks[currentRockIndex].floorPrice) {
      message.info('Precios mayores a los precios piso no necesitan solicitud');
      return;
    }

    setPrices([
      ...prices,
      {
        rock: filteredRocks[currentRockIndex].id,
        nameToDisplay: filteredRocks[currentRockIndex].name,
        priceRequested
      }
    ]);
    setNewPriceForm({ currentRockIndex: undefined, priceRequested: undefined });
  };

  const removeRock = index => {
    const newPrices = [...prices];
    newPrices.splice(index, 1);
    setPrices(newPrices);
  };

  const handleOk = async () => {
    if (prices.length === 0) {
      message.warning('Necesitas añadir almenos un precio especial a la solicitud');
      return;
    }

    if (!beneficiary) {
      message.warning('Selecciona el usuario que recibirá los precios especiales');
      return;
    }

    await client.mutate({
      mutation: ADD_PRICE_REQUEST,
      variables: {
        priceRequest: {
          client: beneficiary,
          prices: prices.map(({ rock, priceRequested }) => ({ rock, priceRequested }))
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
      <Divider style={{ marginTop: 0 }} orientation="left">
        ¿Para quién es la solicitud de precios?
      </Divider>
      <Select
        showSearch
        allowClear
        style={{ width: '100%' }}
        placeholder="Cliente beneficiado"
        onSearch={onSearch}
        onChange={value => setBeneficiary(value.split(':')[0])}
        notFoundContent={null}
        loading={loadingClients}
      >
        {/* IT IS NEEDED TO SET THE VALUE AS ID:BUSINESSNAME,
          OTHERWISE THE INPUT DOESN'T RENDER THE OPTIONS
          WHYYYYYY!!!!!? */}
        {clients.map(({ id, businessName }) => (
          <Option key={id} value={`${id}:${businessName}`}>
            {businessName}
          </Option>
        ))}
      </Select>
      <Divider orientation="left">Añade las piedras y sus precios especiales</Divider>
      <NewPriceForm onSubmit={addRock}>
        <Select
          allowClear
          onChange={currentRockIndex => setNewPriceForm({ ...newPriceForm, currentRockIndex })}
          value={
            typeof newPriceForm.currentRockIndex === 'number'
              ? newPriceForm.currentRockIndex
              : undefined
          }
          style={{ flexBasis: '60%', width: '100%', marginRight: 5 }}
          placeholder="Piedras disponibles"
        >
          {filteredRocks.map(({ id, name, floorPrice }, index) => (
            <Option style={{ display: 'flex' }} key={id} value={index}>
              <Text style={{ marginRight: 'auto' }}>{name}</Text>
              <Tag color="orange">Piso: ${floorPrice}MXN</Tag>
            </Option>
          ))}
        </Select>
        <InputNumber
          required
          value={newPriceForm.priceRequested}
          onChange={priceRequested => setNewPriceForm({ ...newPriceForm, priceRequested })}
          style={{ flexBasis: '30%', width: '100%', marginRight: 5 }}
          placeholder="MXN / Ton"
          min={0}
          step={0.01}
        />
        <Button
          onClick={addRock}
          style={{ flexBasis: '10%', width: '100%' }}
          type="primary"
          icon="plus"
        />
      </NewPriceForm>
      <List
        style={{ marginTop: 10 }}
        bordered
        dataSource={prices}
        renderItem={({ nameToDisplay, priceRequested }, index) => (
          <Item>
            <Text>{nameToDisplay}</Text>
            <div>
              <Tag color="blue">Solicitado: ${priceRequested}MXN</Tag>
              <Button onClick={() => removeRock(index)} type="danger" icon="delete" size="small" />
            </div>
          </Item>
        )}
      />
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
