import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withApollo } from 'react-apollo';
import { Button, Drawer, Form, Icon, Input, message, Select } from 'antd';
import CFDIuseComponent from 'utils/enums/CFDIuse';
import { EDIT_CLIENT } from './graphql/mutations';

const { Option } = Select;

class EditForm extends Component {
  state = {
    loading: false
  };

  handleSubmit = e => {
    const {
      form,
      onClientEdit,
      currentClient: { id },
      setCurrentClient,
      client
    } = this.props;

    this.setState({ loading: true });
    e.preventDefault();
    form.validateFields(
      async (
        err,
        {
          firstName,
          lastName,
          email,
          businessName,
          rfc,
          CFDIuse,
          cellphone,
          country,
          state,
          city,
          suburb,
          municipality,
          street,
          extNumber,
          intNumber,
          zipcode
        }
      ) => {
        if (!err) {
          try {
            const {
              data: { clientEdit: cli }
            } = await client.mutate({
              mutation: EDIT_CLIENT,
              variables: {
                client: {
                  id,
                  firstName,
                  lastName,
                  email,
                  businessName,
                  rfc,
                  CFDIuse,
                  cellphone,
                  address: {
                    country,
                    state,
                    city,
                    suburb,
                    municipality,
                    street,
                    extNumber,
                    intNumber,
                    zipcode
                  }
                }
              }
            });

            message.success(`Cliente ${cli.businessName} ha sido editado exitosamente!`);

            onClientEdit(cli);
            form.resetFields();
            setCurrentClient();
          } catch (error) {
            message.error('Ha habido un error modificando la información');

            this.setState({ loading: false });
          }
        } else {
          this.setState({ loading: false });
        }
      }
    );
  };

  handleCancel = () => {
    const { setCurrentClient } = this.props;

    setCurrentClient();
  };

  render() {
    const { form, currentClient } = this.props;
    const { loading } = this.state;

    return (
      <Drawer
        title={`Editando cliente: ${currentClient.businessName}`}
        visible={currentClient !== null}
        onClose={this.handleCancel}
        width={600}
      >
        <Form onSubmit={this.handleSubmit}>
          <Form.Item>
            {form.getFieldDecorator('firstName', {
              rules: [
                {
                  required: true,
                  message: 'Nombre(s) del vendedor es requerido!'
                }
              ],
              initialValue: currentClient.firstName
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
                  message: 'Apellidos(s) del vendedor es requerido!'
                }
              ],
              initialValue: currentClient.lastName
            })(
              <Input
                prefix={<Icon type="info" style={{ color: 'rgba(0,0,0,.25)' }} />}
                placeholder="Apellidos"
              />
            )}
          </Form.Item>
          <Form.Item>
            {form.getFieldDecorator('email', { initialValue: currentClient.email })(
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
              ],
              initialValue: currentClient.businessName
            })(
              <Input
                prefix={<Icon type="info" style={{ color: 'rgba(0,0,0,.25)' }} />}
                placeholder="Razón social"
              />
            )}
          </Form.Item>
          <Form.Item>
            {form.getFieldDecorator('rfc', { initialValue: currentClient.rfc })(
              <Input
                prefix={<Icon type="number" style={{ color: 'rgba(0,0,0,.25)' }} />}
                placeholder="RFC"
              />
            )}
          </Form.Item>
          <Form.Item>
            {form.getFieldDecorator('CFDIuse', { initialValue: currentClient.CFDIuse })(
              <Select placeholder="Uso de CFDI">
                {CFDIuseComponent.map(option => (
                  <Option key={option} value={option}>
                    {`${option}`}
                  </Option>
                ))}
              </Select>
            )}
          </Form.Item>
          <Form.Item>
            {form.getFieldDecorator('cellphone', { initialValue: currentClient.cellphone })(
              <Select
                placeholder="Números de contacto"
                mode="tags"
                maxTagCount={1}
                tokenSeparators={[',']}
              />
            )}
          </Form.Item>
          <Form.Item>
            {form.getFieldDecorator('country', { initialValue: currentClient?.address?.country })(
              <Input
                prefix={<Icon type="home" style={{ color: 'rgba(0,0,0,.25)' }} />}
                placeholder="País"
              />
            )}
          </Form.Item>
          <Form.Item>
            {form.getFieldDecorator('state', { initialValue: currentClient?.address?.state })(
              <Input
                prefix={<Icon type="home" style={{ color: 'rgba(0,0,0,.25)' }} />}
                placeholder="Estado"
              />
            )}
          </Form.Item>
          <Form.Item>
            {form.getFieldDecorator('municipality', {
              initialValue: currentClient?.address?.municipality
            })(
              <Input
                prefix={<Icon type="home" style={{ color: 'rgba(0,0,0,.25)' }} />}
                placeholder="Municipio"
              />
            )}
          </Form.Item>
          <Form.Item>
            {form.getFieldDecorator('city', { initialValue: currentClient?.address?.city })(
              <Input
                prefix={<Icon type="home" style={{ color: 'rgba(0,0,0,.25)' }} />}
                placeholder="Ciudad"
              />
            )}
          </Form.Item>
          <Form.Item>
            {form.getFieldDecorator('suburb', { initialValue: currentClient?.address?.suburb })(
              <Input
                prefix={<Icon type="home" style={{ color: 'rgba(0,0,0,.25)' }} />}
                placeholder="Colonia"
              />
            )}
          </Form.Item>
          <Form.Item>
            {form.getFieldDecorator('street', { initialValue: currentClient?.address?.street })(
              <Input
                prefix={<Icon type="home" style={{ color: 'rgba(0,0,0,.25)' }} />}
                placeholder="Calle"
              />
            )}
          </Form.Item>
          <Form.Item>
            {form.getFieldDecorator('extNumber', {
              initialValue: currentClient?.address?.extNumber
            })(
              <Input
                prefix={<Icon type="home" style={{ color: 'rgba(0,0,0,.25)' }} />}
                placeholder="Número ext."
              />
            )}
          </Form.Item>
          <Form.Item>
            {form.getFieldDecorator('intNumber', {
              initialValue: currentClient?.address?.intNumber
            })(
              <Input
                prefix={<Icon type="home" style={{ color: 'rgba(0,0,0,.25)' }} />}
                placeholder="Número int."
              />
            )}
          </Form.Item>
          <Form.Item>
            {form.getFieldDecorator('zipcode', { initialValue: currentClient?.address?.zipcode })(
              <Input
                prefix={<Icon type="home" style={{ color: 'rgba(0,0,0,.25)' }} />}
                placeholder="Código postal"
              />
            )}
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" icon="save" loading={loading}>
              {(loading && 'Espere..') || 'Guardar'}
            </Button>
          </Form.Item>
        </Form>
      </Drawer>
    );
  }
}

EditForm.propTypes = {
  client: PropTypes.object.isRequired,
  form: PropTypes.object.isRequired,
  currentClient: PropTypes.object.isRequired,
  onClientEdit: PropTypes.func.isRequired,
  setCurrentClient: PropTypes.func.isRequired
};

export default withApollo(EditForm);
