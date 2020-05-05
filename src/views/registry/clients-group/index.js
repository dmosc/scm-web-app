import React, { useEffect, useState } from 'react';
import { withApollo } from 'react-apollo';
import { useDebounce } from 'use-lodash-debounce';
import { useAuth } from 'components/providers/withAuth';
import PropTypes from 'prop-types';
import shortid from 'shortid';
import { Button, Form, Table, Tag } from 'antd';
import { Card, TableContainer } from './elements';
import Title from './components/title';
import EditForm from './components/clients-group-edit-form';
import NewForm from './components/new-clients-group-form';
import { GET_CLIENTS_GROUPS } from './graphql/queries';

const ClientsGroups = ({ client }) => {
  const { isSupport, isManager, isAdmin } = useAuth();
  const [clientsGroups, setClientsGroups] = useState([]);
  const [filters, setFilters] = useState({ search: '' });
  const [loading, setLoading] = useState(true);
  const [currentClientsGroup, setCurrentClientsGroup] = useState(null);
  const [isNewClientsGroupModalOpen, toggleNewClientsGroupModal] = useState(false);
  const debouncedFilters = useDebounce(filters, 1000);

  const NewClientsGroupForm = Form.create({ name: 'clientsGroup' })(NewForm);
  const ClientsGroupEditForm = Form.create({ name: 'clientsGroupEdit' })(EditForm);

  useEffect(() => {
    const getClientsGroups = async () => {
      const {
        data: { clientsGroups: clientsGroupsToSet }
      } = await client.query({
        query: GET_CLIENTS_GROUPS,
        variables: { filters: debouncedFilters }
      });

      if (!clientsGroupsToSet) throw new Error('No se han podido cargar los grupos de clientes!');

      setLoading(false);
      setClientsGroups(clientsGroupsToSet);
    };

    getClientsGroups();
  }, [debouncedFilters, client]);

  const handleFilterChange = (key, value) => {
    const filtersToSet = { ...filters, [key]: value };

    setFilters(filtersToSet);
  };

  const onClientsGroupEdit = clientsGroup => {
    const clientsGroupsToSet = [...clientsGroups];

    clientsGroupsToSet.forEach(({ id }, i) => {
      if (clientsGroup.id === id) clientsGroupsToSet[i] = { ...clientsGroup };
    });

    setClientsGroups(clientsGroupsToSet);
  };

  const columns = [
    {
      title: 'Nombre',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Clientes',
      dataIndex: 'clients',
      key: 'clients',
      render: clients => <Tag>{clients.length}</Tag>
    },
    {
      title: 'Acciones',
      key: 'action',
      align: 'right',
      render: row => (
        <Button
          onClick={() => setCurrentClientsGroup(row)}
          disabled={!isSupport && !isManager && !isAdmin}
          type="default"
          icon="edit"
          size="small"
        />
      )
    }
  ];

  return (
    <TableContainer>
      <Card>
        <Table
          loading={loading}
          columns={columns}
          title={() => (
            <Title
              handleFilterChange={handleFilterChange}
              toggleNewClientsGroupModal={toggleNewClientsGroupModal}
            />
          )}
          size="small"
          scroll={{ x: true, y: true }}
          pagination={{ defaultPageSize: 20 }}
          dataSource={clientsGroups.map(clientsGroupMapped => ({
            ...clientsGroupMapped,
            key: shortid.generate()
          }))}
        />
      </Card>
      {currentClientsGroup && (
        <ClientsGroupEditForm
          onClientsGroupEdit={onClientsGroupEdit}
          setCurrentClientsGroup={setCurrentClientsGroup}
          currentClientsGroup={currentClientsGroup}
        />
      )}
      {isNewClientsGroupModalOpen && (
        <NewClientsGroupForm
          clientsGroups={clientsGroups}
          visible={isNewClientsGroupModalOpen}
          toggleNewClientsGroupModal={toggleNewClientsGroupModal}
          setClientsGroups={setClientsGroups}
        />
      )}
    </TableContainer>
  );
};

ClientsGroups.propTypes = {
  client: PropTypes.object.isRequired
};

export default withApollo(ClientsGroups);
