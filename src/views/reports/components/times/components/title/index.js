import React from 'react';
import PropTypes from 'prop-types';
import { Input, Typography, Tag, Button } from 'antd';
import { FiltersContainer, HeadContainer, InputContainer, TitleContainer } from './elements';

const { Title, Text } = Typography;
const { Search } = Input;

const TableTitle = ({ folioSearch, setFolioSearch, results, updateExcluded, areSelected }) => {
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
        <Button
          disabled={!areSelected}
          onClick={() => updateExcluded(true)}
          type="danger"
          icon="minus"
          ghost
          size="small"
          style={{ marginRight: 5 }}
        >
          Excluir
        </Button>
        <Button
          disabled={!areSelected}
          onClick={() => updateExcluded(false)}
          type="primary"
          icon="plus"
          ghost
          size="small"
        >
          Incluir
        </Button>
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
  results: PropTypes.number.isRequired,
  updateExcluded: PropTypes.func.isRequired,
  areSelected: PropTypes.bool.isRequired
};

export default TableTitle;
