import React, { useState, useEffect } from 'react';
import { withApollo } from 'react-apollo';
import PropTypes from 'prop-types';
import { Form, InputNumber, Button, notification, Modal } from 'antd';
import { EDIT_ROCK } from './graphql/mutations';

const ProductForm = ({ client, currentProduct, visible, toggleEditModal, updateProducts }) => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(currentProduct);

  const handleSubmit = async e => {
    e.preventDefault();
    const { id, name, price, floorPrice } = form;

    if (floorPrice > price) {
      Modal.error({
        title: 'Ajusta los precios correctos',
        content: 'Asegúrate de que el precio sea mayor al precio suelo'
      });
      return;
    }

    setLoading(true);

    const {
      data: { rockEdit: newProduct },
      errors
    } = await client.mutate({
      mutation: EDIT_ROCK,
      variables: {
        rock: { id, name, price, floorPrice }
      }
    });

    setLoading(false);

    if (errors) {
      notification.open({
        message: errors[0].message
      });

      return;
    }

    updateProducts(newProduct);
    toggleEditModal(false);

    notification.open({
      message: `Product ${newProduct.name} ha sido actualizado exitosamente!`
    });

    form.resetFields();
  };

  useEffect(() => {
    setForm(currentProduct);
  }, [currentProduct]);

  return (
    <Modal
      title={`Editando ${currentProduct.name}`}
      visible={visible}
      footer={null}
      onCancel={() => toggleEditModal(false)}
    >
      <Form onSubmit={handleSubmit}>
        <Form.Item
          extra={form.price < form.floorPrice ? 'El precio piso debe ser mayor al precio' : ''}
          validateStatus={form.price < form.floorPrice ? 'error' : ''}
          label="Price"
        >
          <InputNumber
            style={{ width: '100%' }}
            validate
            min={0}
            step={0.1}
            value={form.price}
            onChange={value => setForm({ ...form, price: value })}
          />
        </Form.Item>
        <Form.Item
          label="Floor price"
          extra={form.price < form.floorPrice ? 'El precio piso debe ser mayor al precio' : ''}
          validateStatus={form.price < form.floorPrice ? 'error' : ''}
        >
          <InputNumber
            style={{ width: '100%' }}
            min={0}
            step={0.1}
            value={form.floorPrice}
            onChange={value => setForm({ ...form, floorPrice: value })}
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" icon="save" loading={loading}>
            {(loading && 'Espere..') || 'Guardar'}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

ProductForm.defaultProps = {
  currentProduct: {}
};

ProductForm.propTypes = {
  client: PropTypes.object.isRequired,
  currentProduct: PropTypes.object,
  visible: PropTypes.bool.isRequired,
  toggleEditModal: PropTypes.func.isRequired,
  updateProducts: PropTypes.func.isRequired
};

export default withApollo(ProductForm);
