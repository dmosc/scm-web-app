import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { withApollo } from '@apollo/react-hoc';
import { Table } from 'antd';
import { GET_CLIENTS_PENDING_TICKETS_TO_BILL } from './graphql/queries';

const columns = [
  {
    title: 'Negocio',
    dataIndex: 'businessName',
    key: 'businessName'
  },
  {
    title: 'Boletas',
    dataIndex: 'count',
    key: 'count'
  }
];

const ClientsList = ({ client, currentClient, setCurrentClient }) => {
  const [clients, setClients] = useState([]);

  const rowSelection = {
    selectedRowKeys: [currentClient],
    onChange: (selectedRowKeys, selectedRows) => {
      const newSelection = selectedRowKeys[selectedRowKeys.length - 1];
      const currentSelection = selectedRows[0];

      if (newSelection === currentSelection) {
        rowSelection.selectedRowKeys = [];
        setCurrentClient(null);
      } else {
        rowSelection.selectedRowKeys = [newSelection];
        setCurrentClient(newSelection);
      }
    }
  };

  useEffect(() => {
    const getClients = async () => {
      const {
        data: { clientsPendingTicketsToBill }
      } = await client.query({ query: GET_CLIENTS_PENDING_TICKETS_TO_BILL });

      const clientsToSet = clientsPendingTicketsToBill.map(
        ({ client: { id, businessName }, count }) => ({
          businessName,
          count,
          key: id
        })
      );

      setClients(clientsToSet);
    };

    getClients();
  }, [client]);

  return (
    <Table
      rowSelection={rowSelection}
      columns={columns}
      dataSource={clients}
      showHeader={false}
      bordered={true}
      size="middle"
      scroll={{ x: true, y: true }}
    />
  );
};

ClientsList.defaultProps = {
  currentClient: null
};

ClientsList.propTypes = {
  client: PropTypes.object.isRequired,
  currentClient: PropTypes.string,
  setCurrentClient: PropTypes.func.isRequired
};

export default withApollo(ClientsList);
