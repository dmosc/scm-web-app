import React from 'react';
import PropTypes from 'prop-types';
import { Typography, Input, Button } from 'antd';
import TitleContainer from './elements';

const { Title } = Typography;
const { Search } = Input;

const TableTitle = ({ handleFilterChange, toggleNewTruckModal }) => {
  return (
    <TitleContainer>
      <Title style={{ margin: 'auto 10px' }} level={3}>
        Listado de camiones
      </Title>
      <Search
        style={{ width: 250, margin: 'auto 10px auto auto' }}
        allowClear
        placeholder="Buscar camiones"
        onChange={({ target: { value } }) => handleFilterChange('search', value)}
      />
      <Button type="primary" icon="car" onClick={() => toggleNewTruckModal(true)}>
        Añadir
      </Button>
    </TitleContainer>
  );
};

TableTitle.propTypes = {
  handleFilterChange: PropTypes.func.isRequired,
  toggleNewTruckModal: PropTypes.func.isRequired
};

export default TableTitle;
