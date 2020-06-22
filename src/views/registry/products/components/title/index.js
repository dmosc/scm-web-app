import React from 'react';
import { withApollo } from '@apollo/react-hoc';
import PropTypes from 'prop-types';
import { useAuth } from 'components/providers/withAuth';
import { Button, Input, Typography } from 'antd';
import TitleContainer from './elements';

const { Title } = Typography;
const { Search } = Input;

const TableTitle = ({ handleFilterChange, toggleNewProductForm }) => {
  const { isAdmin } = useAuth();
  return (
    <TitleContainer>
      <Title style={{ margin: 'auto 10px' }} level={3}>
        Listado de productos
      </Title>
      <Search
        style={{ width: 250, margin: 'auto 10px auto auto' }}
        allowClear
        placeholder="Buscar productos"
        onChange={({ target: { value } }) => handleFilterChange('search', value)}
      />
      {isAdmin && <Button
        style={{ margin: 'auto 10px' }}
        type="primary"
        icon="block"
        onClick={() => toggleNewProductForm(true)}
      >
        Añadir
      </Button>}
    </TitleContainer>
  );
};

TableTitle.propTypes = {
  handleFilterChange: PropTypes.func.isRequired,
  toggleNewProductForm: PropTypes.func.isRequired
};

export default withApollo(TableTitle);
