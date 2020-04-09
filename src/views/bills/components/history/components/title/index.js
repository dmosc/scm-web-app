import React from 'react';
import { withApollo } from '@apollo/react-hoc';
import PropTypes from 'prop-types';
import { Input, Typography } from 'antd';
import TitleContainer from './elements';

const { Title } = Typography;
const { Search } = Input;

const TableTitle = ({ handleFilterChange }) => {
  return (
    <TitleContainer>
      <Title style={{ margin: 'auto 10px' }} level={3}>
        Listado de facturas
      </Title>
      <Search
        style={{ width: 250, margin: 'auto 10px auto auto' }}
        allowClear
        placeholder="Buscar por folio"
        onChange={({ target: { value } }) => handleFilterChange('search', value)}
      />
    </TitleContainer>
  );
};

TableTitle.propTypes = {
  handleFilterChange: PropTypes.func.isRequired
};

export default withApollo(TableTitle);
