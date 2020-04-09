import React from 'react';
import PropTypes from 'prop-types';
import { Icon, Table, Tag } from 'antd';
import SearchBox from './components/search-box';

const ClientsList = ({ clients, currentClient, setCurrentClient, setTargetTickets }) => {
  const getColumnSearchProps = dataIndex => {
    return {
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <SearchBox
          setSelectedKeys={setSelectedKeys}
          selectedKeys={selectedKeys}
          confirm={confirm}
          clearFilters={clearFilters}
        />
      ),
      filterIcon: filtered => (
        <Icon type="search" style={{ color: filtered ? '#1890FF' : undefined }} />
      ),
      onFilter: (value, record) =>
        record[dataIndex]
          .toString()
          .toLowerCase()
          .includes(value.toLowerCase())
    };
  };

  const rowSelection = {
    type: 'radio',
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

  const columns = [
    {
      title: 'Negocio',
      dataIndex: 'businessName',
      key: 'businessName',
      ...getColumnSearchProps('businessName')
    },
    {
      title: 'Boletas',
      dataIndex: 'count',
      key: 'count',
      sorter: (a, b) => a.count - b.count,
      render: count => (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Tag>{count}</Tag>
        </div>
      )
    }
  ];

  return (
    <Table
      rowSelection={rowSelection}
      pagination={{ defaultPageSize: 20 }}
      columns={columns}
      dataSource={clients}
      size="middle"
      scroll={{ y: '54vh' }}
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
