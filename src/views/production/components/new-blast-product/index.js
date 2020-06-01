import React, { useState } from 'react';
import { withApollo } from '@apollo/react-hoc';
import PropTypes from 'prop-types';
import { Form, Icon, Input, message, Modal } from 'antd';
import { REGISTER_BLAST_PRODUCT } from './graphql/mutations';

const { TextArea } = Input;

const NewBlastProduct = ({
  form,
  client,
  isNewBlastProductModalOpen,
  toggleNewBlastProductModal
}) => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = e => {
    setLoading(true);

    e.preventDefault();
    form.validateFields(async (err, { name, description }) => {
      if (!err) {
        const {
          data: { blastProduct },
          errors
        } = await client.mutate({
          mutation: REGISTER_BLAST_PRODUCT,
          variables: { blastProduct: { name, description } }
        });

        if (errors) {
          errors.forEach(error => {
            message.error(error.message);
          });
          return;
        }

        message.success(`El producto ${blastProduct.name} ha sido registrado exitosamente!`);
        toggleNewBlastProductModal(false);
      } else {
        message.error('El ingreso ha sido incorrecto!');
      }

      setLoading(false);
    });
  };

  return (
    <Modal
      title="Registrando nuevo producto"
      visible={isNewBlastProductModalOpen}
      cancelText="Cancelar"
      okText="Registrar"
      confirmLoading={loading}
      onCancel={() => toggleNewBlastProductModal(false)}
      onOk={handleSubmit}
    >
      <Form>
        <Form.Item>
          {form.getFieldDecorator('name', {
            rules: [
              {
                required: true,
                message: 'El nombre del producto es requerido!'
              }
            ]
          })(
            <Input
              prefix={<Icon type="info" style={{ color: 'rgba(0,0,0,.25)' }} />}
              placeholder="Nombre del producto"
            />
          )}
        </Form.Item>
        <Form.Item>
          {form.getFieldDecorator('description', {
            rules: [{ required: true, message: '¡Un título es necesario!' }]
          })(
            <TextArea
              allowClear
              placeholder="Descripción del producto"
              autoSize={{ minRows: 4, maxRows: 6 }}
            />
          )}
        </Form.Item>
      </Form>
    </Modal>
  );
};

NewBlastProduct.propTypes = {
  form: PropTypes.object.isRequired,
  client: PropTypes.object.isRequired,
  isNewBlastProductModalOpen: PropTypes.bool.isRequired,
  toggleNewBlastProductModal: PropTypes.func.isRequired
};

export default withApollo(NewBlastProduct);
