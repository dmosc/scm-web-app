import React from 'react';
import PropTypes from 'prop-types';
import { Input, Typography, Tag } from 'antd';
import { FiltersContainer, HeadContainer, InputContainer, TitleContainer } from './elements';

const { Title, Text } = Typography;
const { Search } = Input;

const TableTitle = ({ folioSearch, setFolioSearch, results }) => {
  return (
    <TitleContainer>
      <HeadContainer>
        <Title style={{ margin: 'auto 10px' }} level={3}>
          Listado de boletas
        </Title>
        <Search
          style={{ width: 250, margin: 'auto 10px auto auto' }}
          allowClear
          placeholder="Buscar por folio"
          value={folioSearch}
          onChange={({ target: { value } }) => setFolioSearch(value)}
        />
      </HeadContainer>
      <FiltersContainer>
        <InputContainer>
          <Text type="secondary">Colores:</Text>
          <div style={{ display: 'flex' }}>
            <Tag color="blue">{'<'} 13 min</Tag>
            <Tag color="green">{'<'} 30 min</Tag>
            <Tag color="orange">{'<'} 45 min</Tag>
            <Tag color="red">{'>'} 45 min</Tag>
          </div>
        </InputContainer>
        <InputContainer>
          <Text type="secondary">Resultados:</Text>
          <Text type="secondary">{results}</Text>
        </InputContainer>
      </FiltersContainer>
    </TitleContainer>
  );
};

TableTitle.propTypes = {
  folioSearch: PropTypes.string.isRequired,
  setFolioSearch: PropTypes.func.isRequired,
  results: PropTypes.number.isRequired
};

export default TableTitle;
