import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { withApollo } from '@apollo/react-hoc';
import { Statistic, Icon, Card, Col } from 'antd';
import { FiltersContainer, ChartsContainer, InputContainer } from './elements';

const Turns = ({ client, globalFilters }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {}, []);

  return (
    <>
      <FiltersContainer>
        <InputContainer>
          <p>Filtro 2</p>
        </InputContainer>
        <InputContainer>
          <p>Filtro 2</p>
        </InputContainer>
      </FiltersContainer>
      <Card>
        <Col span={12}>
          <Statistic
            valueStyle={{ color: '#3f8600' }}
            title="Ventas totales"
            value={0}
            suffix="MXN"
            prefix={<Icon type="rise" />}
          />
        </Col>
        <Col span={12}>
          <Statistic
            valueStyle={{ color: '#1890ff' }}
            title="Boletas"
            value={0}
            prefix={<Icon type="file-done" />}
          />
        </Col>
      </Card>
      <ChartsContainer>
        <Card title="Gráfico de pie">
          <p>Gráfica 2</p>
        </Card>
        <Card title="Distribución">
          <p>Gráfica 1</p>
        </Card>
      </ChartsContainer>
      <Card title={`0 Boletas`}>
        <p>Tabla</p>
      </Card>
    </>
  );
};

Turns.propTypes = {
  client: PropTypes.object.isRequired,
  globalFilters: PropTypes.object.isRequired
};

export default withApollo(Turns);
