import React from 'react';
import PropTypes from 'prop-types';
import { Button, Input, Typography } from 'antd';
import TitleContainer from './elements';

const { Title } = Typography;
const { Search } = Input;

const TableTitle = ({ handleFilterChange, toggleNewClientsGroupModal }) => {
  return (
    <TitleContainer>
      <Title style={{ margin: 'auto 10px' }} level={3}>
        Grupos de usuarios
      </Title>
      <Search
        style={{ width: 250, margin: 'auto 10px auto auto' }}
        allowClear
        placeholder="Buscar grupos de usuarios"
        onChange={({ target: { value } }) => handleFilterChange('search', value)}
      />
      <Button type="primary" icon="usergroup-add" onClick={() => toggleNewClientsGroupModal(true)}>
        Crear grupo
      </Button>
    </TitleContainer>
  );
};

TableTitle.propTypes = {
  handleFilterChange: PropTypes.func.isRequired,
  toggleNewClientsGroupModal: PropTypes.func.isRequired
};

export default TableTitle;
