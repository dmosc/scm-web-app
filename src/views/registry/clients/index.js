import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Form, Table, notification, Button } from 'antd';
import { withApollo } from 'react-apollo';
import shortid from 'shortid';
import Title from './components/title';
import { GET_CLIENTS } from './graphql/queries';
import { TableContainer, Card } from './elements';
import EditForm from './components/client-edit-form';
import NewForm from './components/new-client-form';

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
        <Button onClick={() => setCurrentClient(row)} type="default" icon="edit" size="small" />
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
