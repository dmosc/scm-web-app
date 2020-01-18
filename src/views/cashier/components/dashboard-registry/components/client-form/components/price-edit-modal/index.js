import React from 'react';
import {Modal, InputNumber, Button} from 'antd';

const PriceEditModal = ({
  visible,
  currentPrice,
  currentPriceTotal,
  handleAttrChange,
  onPriceUpdate,
  togglePriceModal,
}) => {
  return (
    <Modal
      width={260}
      height={260}
      centered
      title={`Editando precio: ${currentPrice}`}
      visible={visible}
      footer={null}
      onCancel={togglePriceModal}
    >
      <InputNumber
        onChange={currentPriceTotal =>
          handleAttrChange('currentPriceTotal', currentPriceTotal)
        }
        value={currentPriceTotal}
        style={{margin: 5, width: '50%'}}
        autoFocus
        placeholder="Precio por tonelada en MXN"
        min={0}
        step={0.1}
      />
      <Button onClick={onPriceUpdate} style={{margin: 5}} type="primary">
        Agregar
      </Button>
    </Modal>
  );
};

export default PriceEditModal;
