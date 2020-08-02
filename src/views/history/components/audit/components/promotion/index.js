import React from 'react';
import PropTypes from 'prop-types';
import { Descriptions, Typography } from 'antd';

const { Title } = Typography;

const Promotion = ({ promotion }) => {
  return (
    <>
      <Title style={{ marginBottom: 20 }} level={4}>
        Sucursal
      </Title>
      <Descriptions size="small" column={2}>
        <Descriptions.Item label="Promoción">{promotion.name}</Descriptions.Item>
      </Descriptions>
    </>
  );
};

Promotion.propTypes = {
  promotion: PropTypes.shape({
    name: PropTypes.string
  }).isRequired
};

export default Promotion;
