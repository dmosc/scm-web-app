import React, { useState } from 'react';
import { withApollo } from 'react-apollo';
import PropTypes from 'prop-types';
import { Button, Drawer, Form, Icon, Input, InputNumber, message } from 'antd';
import { REGISTER_PRODUCT } from './graphql/mutations';
import { InputColor } from './elements';

const NewProductForm = ({ client, form, visible, toggleNewProductForm, products, setProducts }) => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = e => {
    setLoading(true);
    e.preventDefault();
    form.validateFields(async (err, { name, price, floorPrice, color }) => {
      if (!err) {
        const {
          data: { rock: product },
          errors
        } = await client.mutate({
          mutation: REGISTER_PRODUCT,
          variables: {
            rock: { name, price, floorPrice, color }
          }
        });

        if (product) {
          const productsToSet = [product, ...products];
          setLoading(false);
          setProducts(productsToSet);
          toggleNewProductForm(false);
          form.resetFields();

          message.success(`El producto ${product.name} ha sido registrado exitosamente!`);
        } else {
          errors.forEach(error => message.error(error.message));
        }
      }

      setLoading(false);
    });
  };

  return (
    <Drawer
      title="Añade un nuevo producto"
      visible={visible}
      onClose={() => toggleNewProductForm(false)}
      width={600}
    >
      <Form onSubmit={handleSubmit}>
        <Form.Item>
          {form.getFieldDecorator('name', {
            rules: [
              {
                required: true,
                message: 'Un nombre de producto es requerido!'
              }
            ]
          })(
            <Input
              prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
              placeholder="Nombre del producto"
            />
          )}
        </Form.Item>
        <Form.Item label="Precio">
          {form.getFieldDecorator('price', {
            rules: [
              {
                required: true,
                message: 'El precio base del producto es requerido!'
              }
            ]
          })(
            <InputNumber
              style={{ width: '50%' }}
              min={0}
              step={10}
              prefix={<Icon type="number" style={{ color: 'rgba(0,0,0,.25)' }} />}
            />
          )}
        </Form.Item>
        <Form.Item label="Precio suelo">
          {form.getFieldDecorator('floorPrice', {
            rules: [
              {
                required: true,
                message: 'El precio suelo del producto es requerido!'
              }
            ]
          })(
            <InputNumber
              style={{ width: '50%' }}
              min={0}
              step={10}
              prefix={<Icon type="number" style={{ color: 'rgba(0,0,0,.25)' }} />}
            />
          )}
        </Form.Item>
        <Form.Item label="Color">
          {form.getFieldDecorator('color', {
            initialValue: '#000000',
            rules: [
              {
                required: true,
                message: 'Un color es requerido!'
              }
            ]
          })(<InputColor type="color" />)}
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" icon="save" loading={loading}>
            {(loading && 'Espere..') || 'Guardar'}
          </Button>
        </Form.Item>
      </Form>
    </Drawer>
  );
};

NewProductForm.propTypes = {
  client: PropTypes.object.isRequired,
  form: PropTypes.object.isRequired,
  visible: PropTypes.bool.isRequired,
  toggleNewProductForm: PropTypes.func.isRequired,
  products: PropTypes.arrayOf(PropTypes.object).isRequired,
  setProducts: PropTypes.func.isRequired
};

export default withApollo(NewProductForm);
