import React, { useEffect, useState } from 'react';
import { withApollo } from 'react-apollo';
import PropTypes from 'prop-types';
import { useDebounce } from 'use-lodash-debounce';
import { Button, Divider, Drawer, Form, Icon, Input, message, Select } from 'antd';
import { GET_CLIENTS } from './graphql/queries';
import { EDIT_CLIENTS_GROUP } from './graphql/mutations';

const { Option } = Select;

const EditForm = ({
  client,
  form,
  currentClientsGroup,
  onClientsGroupEdit,
  setCurrentClientsGroup
}) => {
  const [loadingClients, setLoadingClients] = useState(false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [clients, setClients] = useState([]);
  const debouncedSearch = useDebounce(search, 400);

  useEffect(() => {
    const getClients = async () => {
      if (!debouncedSearch) {
        setClients([]);
        setLoadingClients(false);
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

      setLoadingClients(false);
      setClients(clientsToSet);
    };

    getClients();
  }, [client, debouncedSearch]);

  const onSearch = searchToSet => {
    setLoadingClients(!!searchToSet);
    setSearch(searchToSet);
  };

  const handleSubmit = e => {
    setLoading(true);
    e.preventDefault();
    form.validateFields(async (err, args) => {
      const clientsToSet = args.clients.map(({ key }) => key.split(':')[0]);

      if (!err) {
        const {
          data: { clientsGroupEdit: clientsGroup }
        } = await client.mutate({
          mutation: EDIT_CLIENTS_GROUP,
          variables: {
            clientsGroup: { id: currentClientsGroup.id, name: args.name, clients: clientsToSet }
          }
        });

        setLoading(false);

        message.success(`Grupo ${clientsGroup.name} ha sido editado exitosamente!`);

        onClientsGroupEdit(clientsGroup);
        setCurrentClientsGroup();
        form.resetFields();
      } else {
        setLoading(false);
      }
    });
  };

  return (
    <Drawer
      title={`Editando grupo: ${currentClientsGroup.name}`}
      visible={currentClientsGroup !== null}
      onClose={() => setCurrentClientsGroup()}
      width={600}
    >
      <Form onSubmit={handleSubmit}>
        <Form.Item>
          {form.getFieldDecorator('name', {
            initialValue: currentClientsGroup.name,
            rules: [
              {
                required: true,
                message: '¡Un nombre de grupo es requerido!'
              }
            ]
          })(
            <Input
              prefix={<Icon type="info" style={{ color: 'rgba(0,0,0,.25)' }} />}
              placeholder="Nombre del grupo"
            />
          )}
        </Form.Item>
        <Form.Item>
          <Divider style={{ marginTop: 0 }} orientation="left">
            Añadir clientes al grupo
          </Divider>
          {form.getFieldDecorator('clients', {
            initialValue: currentClientsGroup
              ? currentClientsGroup.clients.map(({ id, businessName }) => ({
                  key: id,
                  label: businessName
                }))
              : undefined
          })(
            <Select
              showSearch
              allowClear
              labelInValue
              mode="multiple"
              style={{ width: '100%', overflowY: 'scroll' }}
              placeholder="Buscar clientes por razón social"
              onSearch={onSearch}
              loading={loadingClients}
            >
              {clients.map(({ id, businessName }) => (
                <Option key={id} value={`${id}:${businessName}`}>
                  {businessName}
                </Option>
              ))}
            </Select>
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

EditForm.propTypes = {
  client: PropTypes.object.isRequired,
  form: PropTypes.object.isRequired,
  currentClientsGroup: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    clients: PropTypes.array
  }).isRequired,
  onClientsGroupEdit: PropTypes.func.isRequired,
  setCurrentClientsGroup: PropTypes.func.isRequired
};

export default withApollo(EditForm);
