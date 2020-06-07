import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Card, Modal } from 'antd';

const ImagePreview = ({ src }) => {
  const [openPreview, togglePreview] = useState(false);
  return (
    <>
      <Card
        onClick={() => togglePreview(true)}
        style={{ width: 90, marginRight: 10, marginBottom: 10, cursor: 'pointer' }}
        bodyStyle={{ padding: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <img alt="img" src={src} style={{ width: 80, height: 80, objectFit: 'cover' }} />
      </Card>
      <Modal visible={openPreview} footer={null} onCancel={() => togglePreview(false)}>
        <img alt="Preview" style={{ width: '100%' }} src={src} />
      </Modal>
    </>
  );
};

ImagePreview.propTypes = {
  src: PropTypes.string.isRequired
};

export default ImagePreview;
