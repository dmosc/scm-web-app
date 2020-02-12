import React, { useState } from 'react';
import { withApollo } from 'react-apollo';
import PropTypes from 'prop-types';
import { Form, InputNumber, Button, notification, Modal } from 'antd';
import { EDIT_ROCK } from './graphql/mutations';

const ProductForm = ({
  client,
  form,
  currentProduct,
  visible,
  toggleEditModal,
  updateProducts
}) => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = e => {
    e.preventDefault();
    const { id } = currentProduct;

    setLoading(true);

    form.validateFields(async (err, { name, price }) => {
      if (!err) {
        try {
          const {
            data: { rockEdit: newProduct }
          } = await client.mutate({
            mutation: EDIT_ROCK,
            variables: {
              rock: { id, name, price }
            }
          });

          updateProducts(newProduct);
          setLoading(false);
          toggleEditModal(false);

          notification.open({
            message: `Product ${newProduct.name} ha sido actualizado exitosamente!`
          });

          form.resetFields();
        } catch (error) {
          error.graphQLErrors.map(({ message }) =>
            notification.open({
              message
            })
          );
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    });
  };

  return (
    <Modal
      title={`Editando ${currentProduct.name}`}
      visible={visible}
      footer={null}
      onCancel={() => toggleEditModal(false)}
    >
      <Form onSubmit={handleSubmit} layout="inline">
        <Form.Item>
          {form.getFieldDecorator('price', {
            initialValue: currentProduct?.price
          })(
            <InputNumber
              autoFocus
              style={{ width: '100%' }}
              placeholder={currentProduct?.price}
              min={0}
              step={0.1}
            />
          )}
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
  form: PropTypes.object.isRequired,
  currentProduct: PropTypes.object,
  visible: PropTypes.bool.isRequired,
  toggleEditModal: PropTypes.func.isRequired,
  updateProducts: PropTypes.func.isRequired
};

export default withApollo(ProductForm);
