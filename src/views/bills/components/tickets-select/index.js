import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Tag, Transfer } from 'antd';

const TicketsSelect = ({ tickets, targetTickets, setTargetTickets }) => {
  const [selectedTickets, setSelectedTickets] = useState([]);

  return (
    <>
      <Transfer
        dataSource={tickets}
        listStyle={{
          width: '47%',
          height: 300
        }}
        titles={['Pendientes', 'Factura']}
        targetKeys={targetTickets}
        selectedKeys={selectedTickets}
        onChange={nextTargetTickets => setTargetTickets(nextTargetTickets)}
        onSelectChange={(selectedTicketsToSet, targetTicketsToSet) =>
          setSelectedTickets([...selectedTicketsToSet, ...targetTicketsToSet])
        }
        render={({ folio, totalPrice, product: { name } }) => (
          <>
            <Tag>{folio}</Tag>
            <Tag>{name}</Tag>
            <Tag>{totalPrice}</Tag>
          </>
        )}
      />
    </>
  );
};

TicketsSelect.propTypes = {
  tickets: PropTypes.array.isRequired,
  targetTickets: PropTypes.array.isRequired,
  setTargetTickets: PropTypes.func.isRequired
};

export default TicketsSelect;
