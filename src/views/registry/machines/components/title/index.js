import React from 'react';
import PropTypes from 'prop-types';
import { Button, Input, Typography } from 'antd';
import TitleContainer from './elements';

const { Title } = Typography;
const { Search } = Input;

const TableTitle = ({ handleFilterChange, toggleNewMachineModal }) => {
  return (
    <TitleContainer>
      <Title style={{ margin: 'auto 10px' }} level={3}>
        Listado de máquinas
      </Title>
      <Search
        style={{ width: 250, margin: 'auto 10px auto auto' }}
        allowClear
        placeholder="Buscar máquinas"
        onChange={({ target: { value } }) => handleFilterChange('search', value)}
      />
      <Button type="primary" icon="robot" onClick={() => toggleNewMachineModal(true)}>
        Añadir
      </Button>
    </TitleContainer>
  );
};

TableTitle.propTypes = {
  handleFilterChange: PropTypes.func.isRequired,
  toggleNewMachineModal: PropTypes.func.isRequired
};

export default TableTitle;
