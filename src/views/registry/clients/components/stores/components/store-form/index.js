import React, { useState } from 'react';
import { withApollo } from '@apollo/react-hoc';
import { Button, Form, Icon, Input, message } from 'antd';
import PropTypes from 'prop-types';
import { EDIT_CLIENT_STORE, REGISTER_NEW_CLIENT_STORE } from './graphql/mutations';

const StoreForm = ({ client, form, currentClient, currentStore, setCurrentStore }) => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = e => {
    e.preventDefault();

    setLoading(true);
    form.validateFields(async (err, args) => {
      if (!err) {
        const { data, errors } = await client.mutate({
          mutation: currentStore ? EDIT_CLIENT_STORE : REGISTER_NEW_CLIENT_STORE,
          variables: currentStore
            ? { store: { ...args, id: currentStore.id } }
            : {
                store: {
                  ...args,
                  client: currentClient.id
                }
              }
        });

        const store = data.store ? data.store : data.storeEdit;

        if (errors) {
          message.error(errors[0].message);
          setLoading(false);
          return;
        }

        setLoading(false);
        setCurrentStore(store);

        message.success(`La sucursal ${store.name} ha sido registrada exitosamente!`);
        form.resetFields();
      } else {
        setLoading(false);
      }
    });
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Item>
        {form.getFieldDecorator('address', { initialValue: currentStore?.address || null })(
          <Input
            prefix={<Icon type="info" style={{ color: 'rgba(0,0,0,.25)' }} />}
            placeholder="Dirección de la sucursal"
          />
        )}
      </Form.Item>
      <Form.Item>
        {form.getFieldDecorator('name', {
          initialValue: currentStore?.name || null,
          rules: [
            {
              required: true,
              message: 'Un nombre de referencia es requerido!'
            }
          ]
        })(
          <Input
            prefix={<Icon type="info" style={{ color: 'rgba(0,0,0,.25)' }} />}
            placeholder="Nombre de la sucursal"
          />
        )}
      </Form.Item>
      <Form.Item>
        {form.getFieldDecorator('state', { initialValue: currentStore?.state || null })(
          <Input
            prefix={<Icon type="info" style={{ color: 'rgba(0,0,0,.25)' }} />}
            placeholder="Estado"
          />
        )}
      </Form.Item>
      <Form.Item>
        {form.getFieldDecorator('municipality', {
          initialValue: currentStore?.municipality || null
        })(
          <Input
            prefix={<Icon type="info" style={{ color: 'rgba(0,0,0,.25)' }} />}
            placeholder="Municipio"
          />
        )}
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" icon="save" loading={loading}>
          {(loading && 'Espere...') || 'Guardar'}
        </Button>
      </Form.Item>
    </Form>
  );
};

StoreForm.propTypes = {
  client: PropTypes.object.isRequired,
  currentClient: PropTypes.object.isRequired,
  form: PropTypes.object.isRequired
};

export default withApollo(StoreForm);
