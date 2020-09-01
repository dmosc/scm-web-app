import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Col, Modal, Row, Icon, Button } from 'antd';
import { ImageContainer, PreviewImageContainer } from './elements';

const InPhotoCapturer = ({ inTruckImages, setInTruckImages, visible, onCancel, handleSubmit }) => {
  const [leftPlayer, setLeftPlayer] = useState();
  const [topPlayer, setTopPlayer] = useState();
  const [rightPlayer, setRightPlayer] = useState();
  const [canvasLeft, setCanvasLeft] = useState();
  const [canvasTop, setCanvasTop] = useState();
  const [canvasRight, setCanvasRight] = useState();

  useEffect(() => {
    const findCanvas = () => {
      if (!canvasLeft) setCanvasLeft(document.getElementById('canvas-left'));
      if (!canvasTop) setCanvasTop(document.getElementById('canvas-top'));
      if (!canvasRight) setCanvasRight(document.getElementById('canvas-right'));
      if (canvasLeft && canvasTop && canvasRight) clearInterval(findCanvas);
    };
    setInterval(findCanvas, 100);

    return () => clearInterval(findCanvas);
  }, [canvasLeft, canvasTop, canvasRight, visible]);

  useEffect(() => {
    if (canvasLeft && !leftPlayer) {
      // eslint-disable-next-line no-undef
      const playerToSet = new JSMpeg.Player('ws://localhost:7000', {
        canvas: canvasLeft,
        preserveDrawingBuffer: true,
        loop: false,
        reconnectInterval: false
      });

      setLeftPlayer(playerToSet);
    }
  }, [canvasLeft, leftPlayer]);

  useEffect(() => {
    if (canvasTop && !topPlayer) {
      // eslint-disable-next-line no-undef
      const playerToSet = new JSMpeg.Player('ws://localhost:7001', {
        canvas: canvasTop,
        preserveDrawingBuffer: true,
        loop: false,
        reconnectInterval: false
      });

      setTopPlayer(playerToSet);
    }
  }, [topPlayer, canvasTop]);

  useEffect(() => {
    if (canvasRight && !rightPlayer) {
      // eslint-disable-next-line no-undef
      const playerToSet = new JSMpeg.Player('ws://localhost:7002', {
        canvas: canvasRight,
        preserveDrawingBuffer: true,
        loop: false,
        reconnectInterval: false
      });

      setRightPlayer(playerToSet);
    }
  }, [canvasRight, rightPlayer]);

  const capture = id => {
    const dataURL = document.getElementById(id).toDataURL();
    return dataURL;
  };

  return (
    <Modal
      width="95%"
      onCancel={onCancel}
      onOk={handleSubmit}
      title="Captura las fotografías de entrada"
      visible={visible}
    >
      <Row>
        <Col span={8}>
          <canvas
            style={{
              maxWidth: '100%',
              width: '100%'
            }}
            id="canvas-left"
          />
          {!inTruckImages.left ? (
            <PreviewImageContainer>
              <Icon style={{ fontSize: 30 }} type="file-image" />
            </PreviewImageContainer>
          ) : (
            <ImageContainer alt="Preview" src={inTruckImages.left} />
          )}
          <Button
            onClick={() => setInTruckImages({ ...inTruckImages, left: capture('canvas-left') })}
            style={{ width: '100%' }}
            type="primary"
          >
            Capturar
          </Button>
        </Col>
        <Col span={8}>
          <canvas
            style={{
              maxWidth: '100%',
              width: '100%'
            }}
            id="canvas-top"
          />
          {!inTruckImages.top ? (
            <PreviewImageContainer>
              <Icon style={{ fontSize: 30 }} type="file-image" />
            </PreviewImageContainer>
          ) : (
            <ImageContainer alt="Preview" src={inTruckImages.top} />
          )}
          <Button
            onClick={() => setInTruckImages({ ...inTruckImages, top: capture('canvas-top') })}
            style={{ width: '100%' }}
            type="primary"
          >
            Capturar
          </Button>
        </Col>
        <Col span={8}>
          <canvas
            style={{
              maxWidth: '100%',
              width: '100%'
            }}
            id="canvas-right"
          />
          {!inTruckImages.right ? (
            <PreviewImageContainer>
              <Icon style={{ fontSize: 30 }} type="file-image" />
            </PreviewImageContainer>
          ) : (
            <ImageContainer alt="Preview" src={inTruckImages.right} />
          )}
          <Button
            onClick={() => setInTruckImages({ ...inTruckImages, right: capture('canvas-right') })}
            style={{ width: '100%' }}
            type="primary"
          >
            Capturar
          </Button>
        </Col>
        <Button
          onClick={() =>
            setInTruckImages({
              left: capture('canvas-left'),
              top: capture('canvas-top'),
              right: capture('canvas-right')
            })
          }
          style={{ width: '100%', marginTop: 20 }}
          type="primary"
          size="large"
        >
          Capturar todos
        </Button>
      </Row>
    </Modal>
  );
};

InPhotoCapturer.propTypes = {
  inTruckImages: PropTypes.shape({
    left: PropTypes.string,
    top: PropTypes.string,
    right: PropTypes.string
  }).isRequired,
  setInTruckImages: PropTypes.func.isRequired,
  visible: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired
};

export default InPhotoCapturer;
