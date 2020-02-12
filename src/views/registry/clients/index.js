import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Form, Table, notification, Button, Row, Modal } from 'antd';
import { withApollo } from 'react-apollo';
import shortid from 'shortid';
import Title from './components/title';
import { GET_CLIENTS } from './graphql/queries';
import { DELETE_CLIENT } from './graphql/mutations';
import { TableContainer, Card } from './elements';
import EditForm from './components/client-edit-form';
import NewForm from './components/new-client-form';

const { confirm } = Modal;

const Clients = ({ client }) => {
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState([]);
  const [filters, setFilters] = useState({ search: '' });
  const [currentClient, setCurrentClient] = useState(null);
  const [isNewClientModalOpen, toggleNewClientModal] = useState(false);

  const handleFilterChange = (key, value) => {
    const filtersToSet = { ...filters, [key]: value };

    setFilters(filtersToSet);
  };

  const NewClientForm = Form.create({ name: 'client' })(NewForm);
  const ClientEditForm = Form.create({ name: 'clientEdit' })(EditForm);

  useEffect(() => {
    const getData = async () => {
      try {
        setLoading(true);
        const {
          data: { clients: clientsToSet }
        } = await client.query({ query: GET_CLIENTS, variables: { filters } });

        setClients(clientsToSet);
        setLoading(false);
      } catch (e) {
        notification.open({
          message: 'No se han podido cargar los clientes correctamente.'
        });
      }
    };

    getData();
  }, [filters, client]);

  const onClientEdit = clientToEdit => {
    const oldClients = [...clients];

    oldClients.forEach(({ id }, i) => {
      if (clientToEdit.id === id) oldClients[i] = { ...clientToEdit };
    });

    setClients(oldClients);
  };

  const deleteClient = clientToDelete => {
    confirm({
      title: '¿Estás seguro de que deseas eliminar a este cliente?',
      content: 'Una vez eliminado, ya no aparecerá en la lista de usuarios',
      okType: 'danger',
      onOk: async () => {
        await client.mutate({
          mutation: DELETE_CLIENT,
          variables: { id: clientToDelete.id }
        });

        setClients(clients.filter(({ id }) => id !== clientToDelete.id));

        notification.open({
          message: `El cliente ${clientToDelete.businessName} ha sido removido`
        });
      },
      onCancel: () => {}
    });
  };

  const columns = [
    {
      title: 'Negocio',
      dataIndex: 'businessName',
      key: 'businessName'
    },
    {
      title: 'Nombre',
      dataIndex: 'firstName',
      key: 'firstName'
    },
    {
      title: 'Apellidos',
      dataIndex: 'lastName',
      key: 'lastName'
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email'
    },
    {
      title: 'Celular',
      dataIndex: 'cellphone',
      key: 'cellphone'
    },
    {
      title: 'Action',
      key: 'action',
      align: 'right',
      render: row => (
        <Row>
          <Button
            style={{ marginRight: 5 }}
            onClick={() => setCurrentClient(row)}
            type="default"
            icon="edit"
            size="small"
          />
          <Button onClick={() => deleteClient(row)} type="danger" icon="delete" size="small" />
        </Row>
      )
    }
  ];

  return (
    <TableContainer>
      <Card bordered={false}>
        <Table
          loading={loading}
          columns={columns}
          title={() => (
            <Title
              handleFilterChange={handleFilterChange}
              toggleNewClientModal={toggleNewClientModal}
            />
          )}
          size="small"
          scroll={{ x: true, y: true }}
          pagination={{ defaultPageSize: 20 }}
          dataSource={clients.map(clientMapped => ({ ...clientMapped, key: shortid.generate() }))}
        />
      </Card>
      {currentClient && (
        <ClientEditForm
          onClientEdit={onClientEdit}
          setCurrentClient={setCurrentClient}
          currentClient={currentClient}
        />
      )}
      {isNewClientModalOpen && (
        <NewClientForm
          clients={clients}
          visible={isNewClientModalOpen}
          toggleNewClientModal={toggleNewClientModal}
          setClients={setClients}
        />
      )}
    </TableContainer>
  );
};

Clients.propTypes = {
  client: PropTypes.object.isRequired
};

export default withApollo(Clients);
