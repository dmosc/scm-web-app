import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { withApollo } from 'react-apollo';
import { Button, Drawer, Form, Icon, Input, Select, message, InputNumber } from 'antd';
import CFDIUseEnum from 'utils/enums/CFDIuse';
import { REGISTER_CLIENT } from './graphql/mutations';

const { Option } = Select;

const NewClientForm = ({ form, visible, toggleNewClientModal, client, clients, setClients }) => {
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState({});

  const handleSubmit = e => {
    e.preventDefault();
    const oldClients = [...clients];

    setLoading(true);
    form.validateFields(
      async (
        err,
        { firstName, lastName, email, businessName, rfc, CFDIuse, cellphone, defaultCreditDays }
      ) => {
        if (!err) {
          const {
            data: { client: cli },
            errors
          } = await client.mutate({
            mutation: REGISTER_CLIENT,
            variables: {
              client: {
                firstName,
                lastName,
                email,
                businessName,
                rfc,
                CFDIuse,
                cellphone,
                defaultCreditDays,
                address: Object.keys(address).length > 0 ? address : null
              }
            }
          });

          if (errors) {
            message.error(errors[0].message);
            setLoading(false);
            return;
          }

          const clientsToSet = [cli, ...oldClients];
          setLoading(false);
          setClients(clientsToSet);
          setAddress({});

          message.success(`Cliente ${cli.businessName} ha sido registrado exitosamente!`);

          toggleNewClientModal(false);

          form.resetFields();
        } else {
          setLoading(false);
        }
      }
    );
  };

  return (
    <Drawer
      title="Añade un nuevo cliente"
      visible={visible}
      onClose={() => toggleNewClientModal(false)}
      width={600}
    >
      <Form onSubmit={handleSubmit}>
        <Form.Item>
          {form.getFieldDecorator('firstName', {
            rules: [
              {
                required: true,
                message: 'Nombre(s) del vendedor es requerido!'
              }
            ]
          })(
            <Input
              prefix={<Icon type="info" style={{ color: 'rgba(0,0,0,.25)' }} />}
              placeholder="Nombre(s)"
            />
          )}
        </Form.Item>
        <Form.Item>
          {form.getFieldDecorator('lastName', {
            rules: [
              {
                required: true,
                message: 'Apellidos del vendedor son requerido!'
              }
            ]
          })(
            <Input
              prefix={<Icon type="info" style={{ color: 'rgba(0,0,0,.25)' }} />}
              placeholder="Apellidos"
            />
          )}
        </Form.Item>
        <Form.Item>
          {form.getFieldDecorator('email')(
            <Input
              prefix={<Icon type="mail" style={{ color: 'rgba(0,0,0,.25)' }} />}
              placeholder="Email"
            />
          )}
        </Form.Item>
        <Form.Item>
          {form.getFieldDecorator('businessName', {
            rules: [
              {
                required: true,
                message: 'Nombre del negocio es requerido!'
              }
            ]
          })(
            <Input
              prefix={<Icon type="info" style={{ color: 'rgba(0,0,0,.25)' }} />}
              placeholder="Razón social"
            />
          )}
        </Form.Item>
        <Form.Item>
          {form.getFieldDecorator('rfc')(
            <Input
              prefix={<Icon type="number" style={{ color: 'rgba(0,0,0,.25)' }} />}
              placeholder="RFC"
            />
          )}
        </Form.Item>
        <Form.Item>
          {form.getFieldDecorator('CFDIuse')(
            <Select placeholder="Uso de CFDI">
              {CFDIUseEnum.map(option => (
                <Option key={option} value={option}>
                  {`${option}`}
                </Option>
              ))}
            </Select>
          )}
        </Form.Item>
        <Form.Item>
          {form.getFieldDecorator('cellphone')(
            <Select
              placeholder="Números de contacto"
              mode="tags"
              maxTagCount={1}
              tokenSeparators={[',']}
            />
          )}
        </Form.Item>
        <Form.Item>
          <Input
            prefix={<Icon type="home" style={{ color: 'rgba(0,0,0,.25)' }} />}
            placeholder="País"
            onChange={({ target: { value } }) => setAddress({ ...address, country: value })}
          />
        </Form.Item>
        <Form.Item>
          <Input
            prefix={<Icon type="home" style={{ color: 'rgba(0,0,0,.25)' }} />}
            placeholder="Estado"
            onChange={({ target: { value } }) => setAddress({ ...address, state: value })}
          />
        </Form.Item>
        <Form.Item>
          <Input
            prefix={<Icon type="home" style={{ color: 'rgba(0,0,0,.25)' }} />}
            placeholder="Municipio"
            onChange={({ target: { value } }) => setAddress({ ...address, municipality: value })}
          />
        </Form.Item>
        <Form.Item>
          <Input
            prefix={<Icon type="home" style={{ color: 'rgba(0,0,0,.25)' }} />}
            placeholder="Ciudad"
            onChange={({ target: { value } }) => setAddress({ ...address, city: value })}
          />
        </Form.Item>
        <Form.Item>
          <Input
            prefix={<Icon type="home" style={{ color: 'rgba(0,0,0,.25)' }} />}
            placeholder="Colonia"
            onChange={({ target: { value } }) => setAddress({ ...address, suburb: value })}
          />
        </Form.Item>
        <Form.Item>
          <Input
            prefix={<Icon type="home" style={{ color: 'rgba(0,0,0,.25)' }} />}
            placeholder="Calle"
            onChange={({ target: { value } }) => setAddress({ ...address, street: value })}
          />
        </Form.Item>
        <Form.Item>
          <Input
            prefix={<Icon type="home" style={{ color: 'rgba(0,0,0,.25)' }} />}
            placeholder="Número ext."
            onChange={({ target: { value } }) => setAddress({ ...address, intNumber: value })}
          />
        </Form.Item>
        <Form.Item>
          <Input
            prefix={<Icon type="home" style={{ color: 'rgba(0,0,0,.25)' }} />}
            placeholder="Número int."
            onChange={({ target: { value } }) => setAddress({ ...address, extNumber: value })}
          />
        </Form.Item>
        <Form.Item>
          <Input
            prefix={<Icon type="home" style={{ color: 'rgba(0,0,0,.25)' }} />}
            placeholder="Código Postal"
            onChange={({ target: { value } }) => setAddress({ ...address, zipcode: value })}
          />
        </Form.Item>
        <Form.Item label="Días de crédito default">
          {form.getFieldDecorator('defaultCreditDays', {
            initialValue: 0,
            rules: [
              {
                required: true,
                message: 'Los días de crédito default son requeridos!'
              }
            ]
          })(
            <InputNumber
              min={0}
              prefix={<Icon type="credit-card" style={{ color: 'rgba(0,0,0,.25)' }} />}
            />
          )}
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" icon="save" loading={loading}>
            {(loading && 'Espere...') || 'Guardar'}
          </Button>
        </Form.Item>
      </Form>
    </Drawer>
  );
};

NewClientForm.propTypes = {
  clients: PropTypes.arrayOf(PropTypes.object).isRequired,
  client: PropTypes.object.isRequired,
  form: PropTypes.object.isRequired,
  visible: PropTypes.bool.isRequired,
  toggleNewClientModal: PropTypes.func.isRequired,
  setClients: PropTypes.func.isRequired
};

export default withApollo(NewClientForm);
