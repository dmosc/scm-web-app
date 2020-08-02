import React from 'react';
import PropTypes from 'prop-types';
import { Descriptions, Typography } from 'antd';

const { Title } = Typography;

const Store = ({ store }) => {
  return (
    <>
      <Title style={{ marginBottom: 20 }} level={4}>
        Sucursal
      </Title>
      <Descriptions size="small" column={2}>
        <Descriptions.Item label="Nombre">{store.name}</Descriptions.Item>
        <Descriptions.Item label="Dirección">{store.address}</Descriptions.Item>
        <Descriptions.Item label="Estado">{store.state}</Descriptions.Item>
        <Descriptions.Item label="Municipio">{store.municipality}</Descriptions.Item>
      </Descriptions>
    </>
  );
};

Store.propTypes = {
  store: PropTypes.shape({
    name: PropTypes.string,
    address: PropTypes.string,
    state: PropTypes.string,
    municipality: PropTypes.string
  }).isRequired
};

export default Store;
