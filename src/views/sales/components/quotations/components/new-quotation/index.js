import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { withApollo } from 'react-apollo';
import moment from 'moment-timezone';
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
  Input,
  Checkbox,
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
  const [loadingBusinessNames, setLoadingBusinessNames] = useState(false);
  const [search, setSearch] = useState('');
  const [filteredRocks, setFilteredRocks] = useState([]);
  const debouncedSearch = useDebounce(search, 400);
  const [prices, setPrices] = useState([]);
  const [quotationForm, setQuotationForm] = useState({});
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
        setLoadingBusinessNames(false);
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

      setLoadingBusinessNames(false);
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
    const { currentRockIndex, priceQuoted, freight } = newPriceForm;

    if (typeof priceQuoted !== 'number') {
      message.error('El precio no es un número');
      return;
    }

    if (quotationForm.hasFreight && typeof freight !== 'number') {
      message.error('El flete no es un número');
      return;
    }

    if (
      !priceQuoted ||
      (quotationForm.hasFreight && !freight) ||
      typeof currentRockIndex !== 'number'
    ) {
      message.error('Completa los campos');
      return;
    }

    setPrices([
      ...prices,
      {
        rock: filteredRocks[currentRockIndex].id,
        nameToDisplay: filteredRocks[currentRockIndex].name,
        freight,
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

    if (!quotationForm.name) {
      message.warning('Especifica para qué nombre (atención) va dirigida la cotización');
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
          products: prices.map(({ rock, priceQuoted, freight }) => ({
            rock,
            price: priceQuoted,
            freight: quotationForm.hasFreight ? freight : undefined
          }))
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
      width="80%"
    >
      <Divider style={{ marginTop: 0 }} orientation="left">
        ¿Para quién es la cotización?
      </Divider>
      <Input
        required
        style={{ width: '100%' }}
        placeholder="Atención"
        value={quotationForm.name ? [quotationForm.name] : undefined}
        onChange={({ target: { value: name } }) => setQuotationForm({ ...quotationForm, name })}
      />
      <Divider orientation="left">Nombre del negocio</Divider>
      <Select
        mode="tags"
        dropdownStyle={{ display: quotationForm.businessName ? 'none' : 'initial' }}
        style={{ width: '100%' }}
        maxTagCount={1}
        placeholder="Nombre del negocio"
        onSearch={setSearch}
        value={quotationForm.businessName ? [quotationForm.businessName] : undefined}
        onChange={values => setQuotationForm({ ...quotationForm, businessName: values[0] })}
        notFoundContent={null}
        loading={loadingBusinessNames}
      >
        {clients.map(({ id, businessName }) => (
          <Option key={id} value={businessName}>
            {businessName}
          </Option>
        ))}
      </Select>
      <Checkbox
        style={{
          marginLeft: 'auto',
          marginTop: 10,
          width: 'fit-content',
          display: 'flex',
          justifyContent: 'right'
        }}
        disabled={prices.length > 0}
        onChange={({ target: { checked } }) =>
          setQuotationForm({ ...quotationForm, hasFreight: checked })
        }
      >
        Incluye flete
      </Checkbox>
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
        {quotationForm.hasFreight && (
          <InputNumber
            required
            value={newPriceForm.freight}
            onChange={freight => setNewPriceForm({ ...newPriceForm, freight })}
            style={{ flexBasis: '30%', width: '100%', marginRight: 5 }}
            placeholder="Flete en MXN / Ton"
            min={0}
            step={0.01}
          />
        )}
        <InputNumber
          required
          value={newPriceForm.priceQuoted}
          onChange={priceQuoted => setNewPriceForm({ ...newPriceForm, priceQuoted })}
          style={{ flexBasis: '30%', width: '100%', marginRight: 5 }}
          placeholder="Cotización en MXN / Ton"
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
        renderItem={({ nameToDisplay, priceQuoted, freight }, index) => (
          <Item>
            <Text>{nameToDisplay}</Text>
            <div>
              {quotationForm.hasFreight && <Tag color="orange">Flete a: ${freight}MXN</Tag>}
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
