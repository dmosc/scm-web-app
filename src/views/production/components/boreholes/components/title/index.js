import React from 'react';
import PropTypes from 'prop-types';
import { Button, Input, Typography } from 'antd';
import { SearchContainer, TitleContainer } from './elements';

const { Title } = Typography;
const { Search } = Input;

const TableTitle = ({ toggleNewBoreHoleModal, setSearch }) => {
  return (
    <TitleContainer>
      <Title style={{ margin: 'auto 10px' }} level={3}>
        Listado de barrenaciones
      </Title>
      <SearchContainer>
        <Search
          style={{ margin: 'auto 10px' }}
          className="search"
          allowClear
          placeholder="Buscar barrenación"
          onChange={({ target: { value } }) => setSearch(value)}
        />
        <Button type="primary" icon="plus" onClick={() => toggleNewBoreHoleModal(true)}>
          Barrenación
        </Button>
      </SearchContainer>
    </TitleContainer>
  );
};

TableTitle.propTypes = {
  toggleNewBoreHoleModal: PropTypes.func.isRequired,
  setSearch: PropTypes.func.isRequired
};

export default TableTitle;
