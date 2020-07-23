import React from 'react';
import PropTypes from 'prop-types';
import { Button, Typography } from 'antd';
import { ActionsContainer, TitleContainer } from './elements';

const { Title } = Typography;

const TableTitle = ({ toggleSupplyFormModal }) => {
  return (
    <TitleContainer>
      <Title style={{ margin: 'auto 10px' }} level={3}>
        Listado de suministros
      </Title>
      <ActionsContainer>
        <Button
          style={{ margin: 'auto 10px auto auto' }}
          type="primary"
          icon="plus"
          onClick={() => toggleSupplyFormModal(true)}
        >
          Suministro
        </Button>
      </ActionsContainer>
    </TitleContainer>
  );
};

TableTitle.propTypes = {
  toggleSupplyFormModal: PropTypes.func.isRequired
};

export default TableTitle;
