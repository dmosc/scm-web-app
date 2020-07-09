import React from 'react';
import PropTypes from 'prop-types';
import { Button, Typography } from 'antd';
import TitleContainer from './elements';

const { Title } = Typography;

const TableTitle = ({ toggleNewBlastModal, toggleNewBlastProductModal }) => {
  return (
    <TitleContainer>
      <Title style={{ margin: 'auto 10px' }} level={3}>
        Listado de voladuras
      </Title>
      <Button
        style={{ margin: 'auto 10px auto auto' }}
        type="primary"
        icon="plus"
        onClick={() => toggleNewBlastModal(true)}
      >
        Voladura
      </Button>
      <Button type="primary" icon="plus" onClick={() => toggleNewBlastProductModal(true)}>
        Producto
      </Button>
    </TitleContainer>
  );
};

TableTitle.propTypes = {
  toggleNewBlastModal: PropTypes.func.isRequired,
  toggleNewBlastProductModal: PropTypes.func.isRequired
};

export default TableTitle;
