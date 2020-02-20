import React from 'react';
import PropTypes from 'prop-types';
import { Modal, InputNumber, Button, Alert } from 'antd';
import { Row } from './elements';

const PriceEditModal = ({
  visible,
  currentPrice,
  currentPriceTotal,
  currentFloorPrice,
  setCurrentPriceTotal,
  currentPublicPrice,
  onPriceUpdate,
  togglePriceModal
}) => {
  const isBelowFloor = currentPriceTotal < currentFloorPrice;
  const isAbovePublic = currentPriceTotal > currentPublicPrice;

  let alertType = 'info';
  let alertMessage = `El precio mínimo es $${currentFloorPrice}MXN y el precio máximo es $${currentPublicPrice}MXN`;

  if (isBelowFloor) {
    alertType = 'error';
    alertMessage = `El precio está por debajo del mínimo de $${currentFloorPrice}MXN`;
  }

  if (isAbovePublic) {
    alertType = 'error';
    alertMessage = `El precio está por encima del público de $${currentPublicPrice}MXN`;
  }

  return (
    <Modal
      centered
      title={`Editando precio: ${currentPrice}`}
      visible={visible}
      footer={null}
      onCancel={() => togglePriceModal(false)}
    >
      <Row>
        <InputNumber
          onChange={setCurrentPriceTotal}
          value={currentPriceTotal}
          style={{ margin: 5, width: '100%' }}
          autoFocus
          placeholder="Precio por tonelada en MXN"
          min={0}
          step={0.1}
        />
        <Button onClick={onPriceUpdate} style={{ margin: 5 }} type="primary">
          Agregar
        </Button>
      </Row>
      <Alert style={{ marginTop: 10 }} message={alertMessage} type={alertType} />
    </Modal>
  );
};

PriceEditModal.defaultProps = {
  currentPrice: 0,
  currentPublicPrice: 0
};

PriceEditModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  currentPrice: PropTypes.any,
  currentPriceTotal: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  currentFloorPrice: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  currentPublicPrice: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  setCurrentPriceTotal: PropTypes.func.isRequired,
  onPriceUpdate: PropTypes.func.isRequired,
  togglePriceModal: PropTypes.func.isRequired
};

export default PriceEditModal;
