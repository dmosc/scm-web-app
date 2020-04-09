import React from 'react';
import PropTypes from 'prop-types';
import { Button, Input } from 'antd';

const SearchBox = ({ selectedKeys, setSelectedKeys, confirm, clearFilters }) => {
  return (
    <div style={{ padding: 8 }}>
      <Input
        placeholder="Filtrar por negocio"
        value={selectedKeys[0]}
        onChange={({ target: { value } }) => setSelectedKeys(value ? [value] : [])}
        onPressEnter={() => confirm()}
        style={{ width: 188, marginBottom: 8, display: 'block' }}
      />
      <Button
        type="primary"
        onClick={() => confirm()}
        size="small"
        style={{ width: 90, marginRight: 8 }}
      >
        Buscar
      </Button>
      <Button onClick={() => clearFilters()} size="small" style={{ width: 90 }}>
        Limpiar
      </Button>
    </div>
  );
};

SearchBox.propTypes = {
  selectedKeys: PropTypes.array.isRequired,
  setSelectedKeys: PropTypes.func.isRequired,
  confirm: PropTypes.func.isRequired,
  clearFilters: PropTypes.func.isRequired
};

export default SearchBox;
