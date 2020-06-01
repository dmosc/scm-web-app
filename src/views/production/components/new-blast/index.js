import React, { useEffect, useState } from 'react';
import { withApollo } from '@apollo/react-hoc';
import PropTypes from 'prop-types';
import { useAuth } from 'components/providers/withAuth';
import { Button, DatePicker, Divider, Form, Icon, InputNumber, List, message, Modal, Select, Tag, Typography, Upload } from 'antd';
import { NewBlastProductForm } from './elements';
import { FILE_UPLOAD, REGISTER_BLAST } from './graphql/mutations';
import { GET_BLAST_PRODUCTS } from './graphql/queries';

const { Item } = List;
const { Text } = Typography;
const { Option } = Select;
const { Dragger } = Upload;

const NewBlast = ({ form, client, blasts, isNewBlastModalOpen, toggleNewBlastModal, setBlasts }) => {
  const [loading, setLoading] = useState(false);
  const [stagedBlastProducts, setStagedBlastProducts] = useState([]);
  const [blastProducts, setBlastProducts] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [filteredBlastProducts, setFilteredBlastProducts] = useState([]);
  const [newBlastProductForm, setNewBlastProductForm] = useState({
    currentBlastProductIndex: undefined,
    price: undefined,
    quantity: undefined
  });

  const { user } = useAuth();

  useEffect(() => {
    const getBlastProducts = async () => {
      setLoading(true);
      const { data, errors } = await client.query({
        query: GET_BLAST_PRODUCTS,
        variables: { filters: {} }
      });

      if (errors) {
        message.error('Ocurrió un error obteniendo los productos');
      } else {
        setBlastProducts(data.blastProducts);
      }

      setLoading(false);
    };

    getBlastProducts();
  }, [client]);

  useEffect(() => {
    const filteredRocksToSet = blastProducts.filter(({ id }) => !stagedBlastProducts.some(({ rock }) => rock === id));

    setFilteredBlastProducts(filteredRocksToSet);
  }, [blastProducts, stagedBlastProducts]);

  const addBlastProduct = event => {
    event.preventDefault();
    const { currentBlastProductIndex, price, quantity } = newBlastProductForm;

    if (!price || !quantity || typeof currentBlastProductIndex !== 'number') {
      message.error('Completa los campos');
      return;
    }

    setStagedBlastProducts([
      ...stagedBlastProducts,
      {
        product: filteredBlastProducts[currentBlastProductIndex].id,
        nameToDisplay: filteredBlastProducts[currentBlastProductIndex].name,
        price,
        quantity
      }
    ]);
    setNewBlastProductForm({ currentBlastProductIndex: undefined, price: undefined, quantity: undefined });
  };

  const removeBlastProduct = index => {
    const newStagedBlastProducts = [...stagedBlastProducts];
    newStagedBlastProducts.splice(index, 1);
    setStagedBlastProducts(newStagedBlastProducts);
  };

  const uploadFile = async file => {
    const { data, errors } = await client.mutate({
      mutation: FILE_UPLOAD,
      variables: { file, folderKey: 'blast_files', id: user.id }
    });

    if (errors) {
      console.log(errors);
    } else {
      console.log(data);
    }
  };

  const handleSubmit = e => {
    setLoading(true);

    e.preventDefault();
    form.validateFields(async (err, { date, tons }) => {
      if (!err) {
        const { data: { blast }, errors } = await client.mutate({
          mutation: REGISTER_BLAST,
          variables: {
            blast:
              {
                date,
                tons,
                products: stagedBlastProducts.map(({ product, price, quantity }) => ({ product, price, quantity })),
                documents
              }
          }
        });

        if (errors) {
          errors.forEach(error => {
            message.error(error.message);
          });
          return;
        }

        message.success('La voladura ha sido registrada exitosamente!');
        toggleNewBlastModal(false);
        setBlasts([blast, ...blasts]);
      } else {
        message.error('No ha sido posible registrar la voladura!');
      }

      setLoading(false);
    });
  };

  return (
    <Modal
      title="Registrando nueva voladura"
      style={{ top: 20 }}
      visible={isNewBlastModalOpen}
      cancelText="Cancelar"
      okText="Registrar"
      confirmLoading={loading}
      onCancel={() => toggleNewBlastModal(false)}
      onOk={handleSubmit}
    >
      <Form>
        <Form.Item style={{ marginBottom: 0 }}>
          <Divider orientation="left">Fecha de ejecución</Divider>
          {form.getFieldDecorator('date', {
            rules: [
              {
                required: true,
                message: 'La fecha de ejecución es requerida!'
              }
            ]
          })(
            <DatePicker/>
          )}
        </Form.Item>
        <Form.Item>
          <Divider orientation="left">Toneladas registradas</Divider>
          {form.getFieldDecorator('tons', {
            rules: [
              {
                type: 'number',
                required: true,
                message: '¡Las toneladas son requeridas!'
              }
            ]
          })(
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              step={0.1}
              placeholder="Ingrese toneladas"
              prefix={<Icon type="number" style={{ color: 'rgba(0,0,0,.25)' }}/>}
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
            />
          )}
        </Form.Item>
      </Form>
      <Divider orientation="left">Productos</Divider>
      <NewBlastProductForm onSubmit={addBlastProduct}>
        <Select
          allowClear
          onChange={currentBlastProductIndex => setNewBlastProductForm({ ...newBlastProductForm, currentBlastProductIndex })}
          value={
            typeof newBlastProductForm.currentBlastProductIndex === 'number'
              ? newBlastProductForm.currentBlastProductIndex
              : undefined
          }
          style={{ flexBasis: '60%', width: '100%', marginRight: 5 }}
          placeholder="Productos disponibles"
        >
          {filteredBlastProducts.map(({ id, name }, index) => (
            <Option style={{ display: 'flex' }} key={id} value={index}>
              <Text style={{ marginRight: 'auto' }}>{name}</Text>
            </Option>
          ))}
        </Select>
        <InputNumber
          required
          value={newBlastProductForm.price}
          onChange={price => setNewBlastProductForm({ ...newBlastProductForm, price })}
          style={{ flexBasis: '30%', width: '100%', marginRight: 5 }}
          placeholder="PPU"
          min={0}
          step={0.01}
        />
        <InputNumber
          required
          value={newBlastProductForm.quantity}
          onChange={quantity => setNewBlastProductForm({ ...newBlastProductForm, quantity })}
          style={{ flexBasis: '30%', width: '100%', marginRight: 5 }}
          placeholder="Unidades"
          min={0}
          step={0.01}
        />
        <Button
          onClick={addBlastProduct}
          style={{ flexBasis: '10%', width: '100%' }}
          type="primary"
          icon="plus"
        />
      </NewBlastProductForm>
      <List
        style={{ marginTop: 10 }}
        bordered
        dataSource={stagedBlastProducts}
        renderItem={({ nameToDisplay, price, quantity }, index) => (
          <Item>
            <Text>{nameToDisplay}</Text>
            <div>
              <Tag color="blue">PPU: ${price}MXN</Tag>
              <Tag color="orange">Unidades: {quantity}</Tag>
              <Button
                style={{ marginLeft: 5 }}
                onClick={() => removeBlastProduct(index)}
                type="danger"
                icon="delete"
                size="small"
              />
            </div>
          </Item>
        )}
      />
      <Divider orientation="left">Archivos adjuntos</Divider>
      <Dragger
        name="file"
        multiple={true}
        style={{ marginTop: 20 }}
        onChange={({ file }) => setDocuments([...documents, file])}
      >
        <p className="ant-upload-drag-icon">
          <Icon type="cloud-upload"/>
        </p>
        <p className="ant-upload-text">Seleccione o arrastre archivos asociados a la voladura</p>
      </Dragger>
    </Modal>
  );
};

NewBlast.propTypes = {
  form: PropTypes.object.isRequired,
  client: PropTypes.object.isRequired,
  blasts: PropTypes.array.isRequired,
  isNewBlastModalOpen: PropTypes.bool.isRequired,
  toggleNewBlastModal: PropTypes.func.isRequired,
  setBlasts: PropTypes.func.isRequired
};

export default withApollo(NewBlast);