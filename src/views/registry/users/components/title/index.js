import React from 'react';
import PropTypes from 'prop-types';
import { Typography, Input, Button } from 'antd';
import TitleContainer from './elements';

const { Title } = Typography;
const { Search } = Input;

const TableTitle = ({ handleFilterChange, toggleNewUserModal }) => {
  return (
    <TitleContainer>
      <Title style={{ margin: 'auto 10px' }} level={3}>
        Listado de usuarios
      </Title>
      <Search
        style={{ width: 250, margin: 'auto 10px auto auto' }}
        allowClear
        placeholder="Buscar usuarios"
        onChange={({ target: { value } }) => handleFilterChange('search', value)}
      />
      <Button type="primary" icon="user-add" onClick={() => toggleNewUserModal(true)}>
        Añadir
      </Button>
    </TitleContainer>
  );
};

TableTitle.propTypes = {
  handleFilterChange: PropTypes.func.isRequired,
  toggleNewUserModal: PropTypes.func.isRequired
};

export default TableTitle;
