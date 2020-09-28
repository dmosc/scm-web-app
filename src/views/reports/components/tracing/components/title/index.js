import React from 'react';
import PropTypes from 'prop-types';
import { Typography, Select } from 'antd';
import { TitleContainer, FiltersContainer, InputContainer } from './elements';

const { Title, Text } = Typography;
const { Option } = Select;

const TableTitle = ({ sortBy, setSortBy }) => {
  return (
    <>
      <TitleContainer>
        <Title style={{ margin: 'auto 10px' }} level={3}>
          Seguimiento de clientes en el periodo
        </Title>
      </TitleContainer>
      <FiltersContainer>
        <InputContainer>
          <Text type="secondary">Ordenar por:</Text>
          <Select
            style={{ width: 300 }}
            placeholder="Ordenar por"
            value={sortBy.field}
            onChange={field => setSortBy({ ...sortBy, field })}
          >
            <Option value="ticketsQty">Tickets</Option>
            <Option value="totalWeight">Toneladas</Option>
            <Option value="totalTaxes">Impuestos</Option>
            <Option value="subtotal">Subtotal</Option>
            <Option value="total">Total</Option>
          </Select>
        </InputContainer>
        <InputContainer>
          <Text type="secondary">Orden:</Text>
          <Select
            style={{ width: 300 }}
            placeholder="Orden"
            value={sortBy.order}
            onChange={order => setSortBy({ ...sortBy, order })}
          >
            <Option value="asc">Ascendente</Option>
            <Option value="desc">Descendente</Option>
          </Select>
        </InputContainer>
      </FiltersContainer>
    </>
  );
};

TableTitle.propTypes = {
  sortBy: PropTypes.object.isRequired,
  setSortBy: PropTypes.func.isRequired
};

export default TableTitle;
