import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { withApollo } from 'react-apollo';
import { Modal, Row, Col, Button, Icon, notification } from 'antd';
import { ImageContainer, PreviewImageContainer } from './elements';
import { FILE_UPLOAD, TICKET_OUT_IMAGE_SUBMIT } from './graphql/mutations';

const TicketImageForm = ({ form, user, currentTicket, setCurrent, client, currentForm }) => {
  const [loading, setLoading] = useState(false);
  const [outTruckImage, setOutTruckImage] = useState(false);
  const [outTruckImageBack, setOutTruckImageBack] = useState(false);
  const [frontPlayer, setFrontPlayer] = useState();
  const [backPlayer, setBackPlayer] = useState();
  const [canvasFront, setCanvasFront] = useState();
  const [canvasBack, setCanvasBack] = useState();

  const removeImages = () => {
    setOutTruckImage('/static/images/truck_image.png');
    setOutTruckImageBack('/static/images/truck_image.png');
  };

  useEffect(removeImages, []);

  useEffect(() => {
    if (currentForm === 'image') {
      const findCanvas = () => {
        if (!canvasBack) setCanvasBack(document.getElementById('canvas-back'));
        if (!canvasFront) setCanvasFront(document.getElementById('canvas-front'));
        if (canvasBack && canvasFront) clearInterval(findCanvas);
      };
      setInterval(findCanvas, 100);

      return () => clearInterval(findCanvas);
    }

    return () => {};
  }, [canvasBack, canvasFront, currentForm]);

  useEffect(() => {
    if (canvasFront && !frontPlayer) {
      // eslint-disable-next-line no-undef
      const playerToSet = new JSMpeg.Player('ws://localhost:7003', {
        canvas: canvasFront,
        preserveDrawingBuffer: true,
        loop: false,
        reconnectInterval: false
      });

      setFrontPlayer(playerToSet);
    }
  }, [canvasFront, frontPlayer]);

  useEffect(() => {
    if (canvasBack && !backPlayer) {
      // eslint-disable-next-line no-undef
      const playerToSet = new JSMpeg.Player('ws://localhost:7004', {
        canvas: canvasBack,
        preserveDrawingBuffer: true,
        loop: false,
        reconnectInterval: false
      });

      setBackPlayer(playerToSet);
    }
  }, [backPlayer, canvasBack]);

  const handleSubmit = e => {
    const { id } = user;

    setLoading(true);
    e.preventDefault();
    form.validateFields(async err => {
      if (!err) {
        const [
          {
            data: { imageUpload: outTruckImageLink }
          },
          {
            data: { imageUpload: outTruckImageBackLink }
          }
        ] = await Promise.all([
          client.mutate({
            mutation: FILE_UPLOAD,
            variables: { image: outTruckImage, folderKey: 'trucks', id }
          }),
          client.mutate({
            mutation: FILE_UPLOAD,
            variables: { image: outTruckImageBack, folderKey: 'trucks', id }
          })
        ]);

        if (!outTruckImage) {
          notification.error({
            message: '¡No ha sido posible guardar la imagen correctamente!'
          });

          throw new Error('No ha sido posible guardar las imágenes!');
        } else {
          notification.success({
            message: '¡Las imágenes han sido subida exitosamente!'
          });
        }

        await client.mutate({
          mutation: TICKET_OUT_IMAGE_SUBMIT,
          variables: {
            ticket: {
              id: currentTicket.id,
              outTruckImage: outTruckImageLink,
              outTruckImageBack: outTruckImageBackLink
            }
          }
        });

        form.resetFields();
        setCurrent();
      } else {
        setLoading(false);
        notification('No se ha podido actualizar correctamente', 'error', {
          duration: 3000,
          closeable: true
        });
      }
    });
  };

  const handleCancel = () => {
    setCurrent();
  };

  const capture = id => {
    const dataURL = document.getElementById(id).toDataURL();
    return dataURL;
  };

  return (
    <Modal
      title={`${currentTicket.truck.plates}`}
      visible={currentForm === 'image'}
      onCancel={handleCancel}
      footer={null}
      width="95%"
    >
      <Row display="flex" justify="start">
        <Col span={12}>
          <canvas
            style={{
              maxWidth: '100%',
              width: '100%'
            }}
            id="canvas-front"
          />
          {!outTruckImage ? (
            <PreviewImageContainer>
              <Icon style={{ fontSize: 30 }} type="file-image" />
            </PreviewImageContainer>
          ) : (
            <ImageContainer alt="Preview" src={outTruckImage} />
          )}
          <Button
            onClick={() => setOutTruckImage(capture('canvas-front'))}
            style={{ width: '100%' }}
            type="primary"
          >
            Capturar
          </Button>
        </Col>
        <Col span={12}>
          <canvas
            style={{
              maxWidth: '100%',
              width: '100%'
            }}
            id="canvas-back"
          />
          {!outTruckImageBack ? (
            <PreviewImageContainer>
              <Icon style={{ fontSize: 30 }} type="file-image" />
            </PreviewImageContainer>
          ) : (
            <ImageContainer alt="Preview" src={outTruckImageBack} />
          )}
          <Button
            onClick={() => setOutTruckImageBack(capture('canvas-back'))}
            style={{ width: '100%' }}
            type="primary"
          >
            Capturar
          </Button>
        </Col>
      </Row>
      <Row>
        <Button
          style={{ margin: 5 }}
          type="default"
          onClick={() => {
            setOutTruckImageBack(capture('canvas-back'));
            setOutTruckImage(capture('canvas-front'));
          }}
        >
          Capturar todas
        </Button>
        {outTruckImage && (
          <>
            <Button style={{ margin: 5 }} type="danger" onClick={removeImages}>
              Cancelar
            </Button>
            <Button style={{ margin: 5 }} type="primary" onClick={handleSubmit} loading={loading}>
              {(loading && 'Espere..') || 'OK'}
            </Button>
          </>
        )}
      </Row>
    </Modal>
  );
};

TicketImageForm.propTypes = {
  client: PropTypes.object.isRequired,
  currentForm: PropTypes.object.isRequired,
  currentTicket: PropTypes.object.isRequired,
  form: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  setCurrent: PropTypes.func.isRequired
};

export default withApollo(TicketImageForm);
