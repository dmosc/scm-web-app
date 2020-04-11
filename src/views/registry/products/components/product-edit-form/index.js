import React, { useEffect, useState } from 'react';
import { withApollo } from 'react-apollo';
import PropTypes from 'prop-types';
import { Button, Form, InputNumber, Modal, notification } from 'antd';
import { EDIT_ROCK } from './graphql/mutations';
import { InputColor } from './elements';

const ProductForm = ({ client, currentProduct, visible, toggleEditModal, updateProducts }) => {
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState(currentProduct);

  const handleSubmit = async e => {
    e.preventDefault();
    const { id, name, price, floorPrice, color } = product;

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
        rock: { id, name, price, floorPrice, color }
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
  };

  useEffect(() => {
    setProduct(currentProduct);
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
          extra={
            product.price < product.floorPrice ? 'El precio piso debe ser mayor al precio' : ''
          }
          validateStatus={product.price < product.floorPrice ? 'error' : ''}
          label="Precio"
        >
          <InputNumber
            style={{ width: '100%' }}
            validate
            min={0}
            step={0.1}
            value={product.price}
            onChange={value => setProduct({ ...product, price: value })}
          />
        </Form.Item>
        <Form.Item
          label="Precio suelo"
          extra={
            product.price < product.floorPrice ? 'El precio piso debe ser mayor al precio' : ''
          }
          validateStatus={product.price < product.floorPrice ? 'error' : ''}
        >
          <InputNumber
            style={{ width: '100%' }}
            min={0}
            step={0.1}
            value={product.floorPrice}
            onChange={value => setProduct({ ...product, floorPrice: value })}
          />
        </Form.Item>
        <Form.Item label="Color">
          <InputColor
            type="color"
            value={product.color}
            onChange={({ target: { value } }) =>
              setProduct({ ...product, color: value.toUpperCase() })
            }
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
