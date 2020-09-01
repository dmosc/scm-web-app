import React from 'react';
import PropTypes from 'prop-types';
import { format } from 'utils/functions';
import { Descriptions, Typography } from 'antd';

const { Title } = Typography;

const Product = ({ product, pricePerTon }) => {
  return (
    <>
      <Title style={{ marginBottom: 20 }} level={4}>
        Producto
      </Title>
      <Descriptions size="small" column={2}>
        <Descriptions.Item label="Producto">{product.name}</Descriptions.Item>
        <Descriptions.Item label="Precio por ton">{format.currency(pricePerTon)}</Descriptions.Item>
      </Descriptions>
    </>
  );
};

Product.propTypes = {
  product: PropTypes.shape({
    name: PropTypes.string
  }).isRequired,
  pricePerTon: PropTypes.number.isRequired
};

export default Product;
