import React from 'react';
import PropTypes from 'prop-types';
import { Modal, InputNumber, Button } from 'antd';

const PriceEditModal = ({
  visible,
  currentPrice,
  currentPriceTotal,
  setCurrentPriceTotal,
  onPriceUpdate,
  togglePriceModal
}) => {
  return (
    <Modal
      width={260}
      height={260}
      centered
      title={`Editando precio: ${currentPrice}`}
      visible={visible}
      footer={null}
      onCancel={() => togglePriceModal(false)}
    >
      <InputNumber
        onChange={setCurrentPriceTotal}
        value={currentPriceTotal}
        style={{ margin: 5, width: '50%' }}
        autoFocus
        placeholder="Precio por tonelada en MXN"
        min={0}
        step={0.1}
      />
      <Button onClick={onPriceUpdate} style={{ margin: 5 }} type="primary">
        Agregar
      </Button>
    </Modal>
  );
};

PriceEditModal.defaultProps = {
  currentPrice: 0
};

PriceEditModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  currentPrice: PropTypes.any,
  currentPriceTotal: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  setCurrentPriceTotal: PropTypes.func.isRequired,
  onPriceUpdate: PropTypes.func.isRequired,
  togglePriceModal: PropTypes.func.isRequired
};

export default PriceEditModal;
