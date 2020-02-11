import React from 'react';
import PropTypes from 'prop-types';
import { Typography, Input, Button } from 'antd';
import TitleContainer from './elements';

const { Title } = Typography;
const { Search } = Input;

const TableTitle = ({ handleFilterChange, toggleNewClientModal }) => {
  return (
    <TitleContainer>
      <Title style={{ margin: 'auto 10px' }} level={3}>
        Listado de clientes
      </Title>
      <Search
        style={{ width: 250, margin: 'auto 10px auto auto' }}
        allowClear
        placeholder="Buscar clientes"
        onChange={({ target: { value } }) => handleFilterChange('search', value)}
      />
      <Button type="primary" icon="user-add" onClick={() => toggleNewClientModal(true)}>
        Añadir
      </Button>
    </TitleContainer>
  );
};

TableTitle.propTypes = {
  handleFilterChange: PropTypes.func.isRequired,
  toggleNewClientModal: PropTypes.func.isRequired
};

export default TableTitle;
