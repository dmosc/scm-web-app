import React from 'react';
import PropTypes from 'prop-types';
import { Table } from 'antd';

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

const ClientsList = ({ clients, currentClient, setCurrentClient, setTargetTickets }) => {
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

      setTargetTickets([]);
    }
  };

  return (
    <Table
      rowSelection={rowSelection}
      pagination={{ defaultPageSize: 5 }}
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
  currentClient: PropTypes.string,
  clients: PropTypes.array.isRequired,
  setCurrentClient: PropTypes.func.isRequired,
  setTargetTickets: PropTypes.func.isRequired
};

export default ClientsList;
