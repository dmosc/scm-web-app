import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Select, Tag, Transfer } from 'antd';
import moment from 'moment';

const { Option } = Select;

const TicketsSelect = ({
  type,
  currentClient,
  tickets,
  targetTickets,
  setTargetTickets,
  setType
}) => {
  const [selectedTickets, setSelectedTickets] = useState([]);

  useEffect(() => {
    setSelectedTickets([]);
    setTargetTickets([]);
  }, [type, currentClient, setTargetTickets]);

  return (
    <>
      <Select
        onChange={value => setType(value)}
        style={{ width: 120, marginBottom: 10 }}
        value={type}
        defaultValue={type}
      >
        <Option value="BILL">Factura</Option>
        <Option value="REMISSION">Remisión</Option>
      </Select>
      <Transfer
        dataSource={tickets}
        listStyle={{
          width: '47%',
          height: 250
        }}
        titles={['Pendientes', 'Factura']}
        targetKeys={targetTickets}
        selectedKeys={selectedTickets}
        onChange={nextTargetTickets => setTargetTickets(nextTargetTickets)}
        onSelectChange={(selectedTicketsToSet, targetTicketsToSet) =>
          setSelectedTickets([...selectedTicketsToSet, ...targetTicketsToSet])
        }
        render={({ folio, totalPrice, out, product: { name } }) => (
          <>
            <Tag>{moment(out).format('YYYY/MM/DD')}</Tag>
            <Tag>{folio}</Tag>
            <Tag>{name}</Tag>
            <Tag>{totalPrice}</Tag>
          </>
        )}
      />
    </>
  );
};

TicketsSelect.defaultProps = {
  currentClient: null
};

TicketsSelect.propTypes = {
  currentClient: PropTypes.string,
  type: PropTypes.string.isRequired,
  tickets: PropTypes.array.isRequired,
  targetTickets: PropTypes.array.isRequired,
  setTargetTickets: PropTypes.func.isRequired,
  setType: PropTypes.func.isRequired
};

export default TicketsSelect;
