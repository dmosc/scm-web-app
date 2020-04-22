import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { withApollo } from 'react-apollo';
import moment from 'moment';
import { useDebounce } from 'use-lodash-debounce';
import {
  Drawer,
  Divider,
  Select,
  List,
  Typography,
  InputNumber,
  Button,
  Tag,
  DatePicker,
  message
} from 'antd';
import { NewQuotationForm, Footer } from './elements';
import { GET_CLIENTS, GET_ROCKS } from './graphql/queries';
import { ADD_QUOTATION } from './graphql/mutations';

const { Option } = Select;
const { Item } = List;
const { Text } = Typography;

const NewQuotation = ({ client, visible, toggleNewQuotation, updateFather }) => {
  const [rocks, setRocks] = useState([]);
  const [clients, setClients] = useState([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [search, setSearch] = useState('');
  const [filteredRocks, setFilteredRocks] = useState([]);
  const debouncedSearch = useDebounce(search, 400);
  const [prices, setPrices] = useState([]);
  const [quotationForm, setQuotationForm] = useState(false);
  const [newPriceForm, setNewPriceForm] = useState({
    currentRockIndex: undefined,
    priceQuoted: undefined
  });

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

  useEffect(() => {
    // Wicho, forgive me plz
    const filteredRocksToSet = rocks.filter(({ id }) => !prices.some(({ rock }) => rock === id));

    setFilteredRocks(filteredRocksToSet);
  }, [rocks, prices]);

  const addRock = event => {
    event.preventDefault();
    const { currentRockIndex, priceQuoted } = newPriceForm;

    if (typeof priceQuoted !== 'number') {
      message.error('El precio no es un número');
      return;
    }

    if (!priceQuoted || typeof currentRockIndex !== 'number') {
      message.error('Completa los campos');
      return;
    }

    setPrices([
      ...prices,
      {
        rock: filteredRocks[currentRockIndex].id,
        nameToDisplay: filteredRocks[currentRockIndex].name,
        priceQuoted
      }
    ]);
    setNewPriceForm({ currentRockIndex: undefined, priceQuoted: undefined });
  };

  const removeRock = index => {
    const newPrices = [...prices];
    newPrices.splice(index, 1);
    setPrices(newPrices);
  };

  const createQuotation = async () => {
    if (prices.length === 0) {
      message.warning('Necesitas añadir almenos un precio a la cotización');
      return;
    }

    if (!quotationForm.client) {
      message.warning('Especifica para qué cliente va dirigida la cotización');
      return;
    }

    if (!quotationForm.validUntil) {
      message.warning('Es necesaria la fecha de vencimiento');
      return;
    }

    await client.mutate({
      mutation: ADD_QUOTATION,
      variables: {
        quotation: {
          ...quotationForm,
          products: prices.map(({ rock, priceQuoted }) => ({ rock, price: priceQuoted }))
        }
      }
    });

    toggleNewQuotation(false);

    message.success('Cotización creada correctamente');

    updateFather();
  };

  return (
    <Drawer
      title="Añade una nueva cotización"
      visible={visible}
      onClose={() => toggleNewQuotation(false)}
      width={800}
    >
      <Divider style={{ marginTop: 0 }} orientation="left">
        ¿Para quién es la cotización?
      </Divider>
      <Select
        mode="tags"
        dropdownStyle={{ display: quotationForm.client ? 'none' : 'initial' }}
        style={{ width: '100%' }}
        maxTagCount={1}
        placeholder="Cliente"
        onSearch={setSearch}
        value={quotationForm.client ? [quotationForm.client] : undefined}
        onChange={values => setQuotationForm({ ...quotationForm, client: values[0] })}
        notFoundContent={null}
        loading={loadingClients}
      >
        {clients.map(({ id, businessName }) => (
          <Option key={id} value={businessName}>
            {businessName}
          </Option>
        ))}
      </Select>
      <Divider orientation="left">Añade las piedras y sus precios cotizados</Divider>
      <NewQuotationForm onSubmit={addRock}>
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
          {filteredRocks.map(({ id, name, floorPrice, price }, index) => (
            <Option style={{ display: 'flex' }} key={id} value={index}>
              <Text style={{ marginRight: 'auto' }}>{name}</Text>
              <Tag color="orange">Piso: ${floorPrice}MXN</Tag>
              <Tag color="blue">General: ${price}MXN</Tag>
            </Option>
          ))}
        </Select>
        <InputNumber
          required
          value={newPriceForm.priceQuoted}
          onChange={priceQuoted => setNewPriceForm({ ...newPriceForm, priceQuoted })}
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
      </NewQuotationForm>
      <List
        style={{ marginTop: 10 }}
        bordered
        dataSource={prices}
        renderItem={({ nameToDisplay, priceQuoted }, index) => (
          <Item>
            <Text>{nameToDisplay}</Text>
            <div>
              <Tag color="blue">Cotizado a: ${priceQuoted}MXN</Tag>
              <Button onClick={() => removeRock(index)} type="danger" icon="delete" size="small" />
            </div>
          </Item>
        )}
      />
      <Divider orientation="left">¿Hasta cuándo será válida la cotización?</Divider>
      <DatePicker
        style={{ width: '100%' }}
        onChange={date => setQuotationForm({ ...quotationForm, validUntil: date })}
        disabledDate={d => moment(d).isBefore(moment())}
      />
      <Divider orientation="left">Añade flete</Divider>
      <InputNumber
        value={newPriceForm.freight}
        onChange={freight => setQuotationForm({ ...quotationForm, freight })}
        style={{ width: '100%' }}
        placeholder="MXN"
        min={0}
        step={0.01}
      />
      <Footer>
        <Button onClick={createQuotation} type="primary">
          Crear
        </Button>
      </Footer>
    </Drawer>
  );
};

NewQuotation.propTypes = {
  updateFather: PropTypes.func.isRequired,
  client: PropTypes.object.isRequired,
  visible: PropTypes.bool.isRequired,
  toggleNewQuotation: PropTypes.func.isRequired
};

export default withApollo(NewQuotation);
