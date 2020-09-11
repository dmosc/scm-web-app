import React, { useEffect, useState } from 'react';
import { withApollo } from 'react-apollo';
import { useDebounce } from 'use-lodash-debounce';
import PropTypes from 'prop-types';
import { Button, Form, Modal, notification, Row, Table, Tag, Tooltip } from 'antd';
import shortid from 'shortid';
import { useAuth } from 'components/providers/withAuth';
import Title from './components/title';
import { GET_CLIENTS } from './graphql/queries';
import { DELETE_CLIENT } from './graphql/mutations';
import { Card, TableContainer } from './elements';
import EditForm from './components/client-edit-form';
import NewForm from './components/new-client-form';
import SpecialPrices from './components/special-prices';
import Stores from './components/stores';
import CreditBalance from './components/credit-balance';
import ClientSubscription from './components/client-subscription';

const { confirm } = Modal;

const Clients = ({ client }) => {
  const { isAdmin, isAccountant, isManager, isSupport, isSales } = useAuth();
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    sortBy: {
      field: 'uniqueId',
      order: 'desc'
    }
  });
  const [currentClient, setCurrentClient] = useState(null);
  const [currentClientSubscription, setCurrentClientSubscription] = useState();
  const [currentClientPrices, setCurrentClientPrices] = useState();
  const [currentClientCredit, setCurrentClientCredit] = useState();
  const [currentClientStores, setCurrentClientStores] = useState();
  const [isNewClientModalOpen, toggleNewClientModal] = useState(false);
  const debouncedFilters = useDebounce(filters, 1000);

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
        } = await client.query({ query: GET_CLIENTS, variables: { filters: debouncedFilters } });

        setClients(clientsToSet);
        setLoading(false);
      } catch (e) {
        notification.open({
          message: 'No se han podido cargar los clientes correctamente.'
        });
      }
    };

    getData();
  }, [debouncedFilters, client]);

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
      title: 'ID',
      dataIndex: 'uniqueId',
      key: 'uniqueId',
      fixed: 'left',
      width: 200
    },
    {
      title: 'Negocio',
      dataIndex: 'businessName',
      key: 'businessName',
      fixed: 'left',
      width: 200
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
      key: 'cellphone',
      render: cellphone =>
        cellphone.map(number => (
          <Tag color="geekblue" key={number}>
            {number}
          </Tag>
        ))
    },
    {
      title: 'Acciones',
      key: 'action',
      align: 'right',
      fixed: 'right',
      width: 200,
      render: row => (
        <Row>
          <Tooltip placement="top" title="Editar">
            <Button
              onClick={() => setCurrentClient(row)}
              style={{ marginRight: 5 }}
              icon="edit"
              size="small"
            />
          </Tooltip>
          <Tooltip
            placement="top"
            title={
              row.hasSubscription ? 'Ya existe una subscripción activa' : 'Seguimiento de cliente'
            }
          >
            <Button
              onClick={() => setCurrentClientSubscription(row)}
              style={{ marginRight: 5 }}
              disabled={row.hasSubscription}
              type="primary"
              icon="eye"
              size="small"
            />
          </Tooltip>
          <Tooltip placement="top" title="Precios especiales">
            <Button
              onClick={() => setCurrentClientPrices(row)}
              style={{ marginRight: 5 }}
              type="primary"
              icon="star"
              size="small"
            />
          </Tooltip>
          {!isSales && (
            <Tooltip placement="top" title="Crédito y balance">
              <Button
                onClick={() => setCurrentClientCredit(row)}
                style={{ marginRight: 5 }}
                type="primary"
                icon="credit-card"
                size="small"
              />
            </Tooltip>
          )}
          <Tooltip placement="top" title="Sucursales">
            <Button
              onClick={() => setCurrentClientStores(row)}
              style={{ marginRight: 5 }}
              type="primary"
              icon="appstore"
              size="small"
            />
          </Tooltip>
          {(isAdmin || isAccountant || isManager || isSupport) && (
            <Tooltip placement="top" title="Eliminar">
              <Button onClick={() => deleteClient(row)} type="danger" icon="delete" size="small" />
            </Tooltip>
          )}
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
          scroll={{ x: 1500, y: 600 }}
          title={() => (
            <Title
              handleFilterChange={handleFilterChange}
              toggleNewClientModal={toggleNewClientModal}
              filters={filters}
            />
          )}
          size="small"
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
      {currentClientSubscription && (
        <ClientSubscription
          close={() => setCurrentClientSubscription(undefined)}
          currentClient={currentClientSubscription}
        />
      )}
      {currentClientPrices && (
        <SpecialPrices
          close={() => setCurrentClientPrices(undefined)}
          currentClient={currentClientPrices}
        />
      )}
      {currentClientCredit && (
        <CreditBalance
          close={() => setCurrentClientCredit(undefined)}
          currentClient={currentClientCredit}
        />
      )}
      {currentClientStores && (
        <Stores
          close={() => setCurrentClientStores(undefined)}
          currentClient={currentClientStores}
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
