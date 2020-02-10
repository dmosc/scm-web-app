import React, { Component } from 'react';
import { withApollo } from 'react-apollo';
import Webcam from 'react-webcam';
import { Modal, Row, Col, Button, Icon, notification } from 'antd';
import { ImageContainer, PreviewImageContainer } from './elements';
import { FILE_UPLOAD, TICKET_OUT_IMAGE_SUBMIT } from './graphql/mutations';

class TicketImageForm extends Component {
  constructor(props) {
    super(props);
    this.camRef = React.createRef();
    this.state = {
      loading: false,
      outTruckImage: null
    };
  }

  componentDidMount = () => this.setState({ outTruckImage: '/static/images/truck_image.png' });

  handleSubmit = e => {
    const {
      form,
      user: { id },
      currentTicket,
      setCurrent,
      client
    } = this.props;

    this.setState({ loading: true });
    e.preventDefault();
    form.validateFields(async err => {
      if (!err) {
        const { outTruckImage: image } = this.state;
        try {
          const {
            data: { imageUpload: outTruckImage }
          } = await client.mutate({
            mutation: FILE_UPLOAD,
            variables: { image, folderKey: 'trucks', id }
          });

          if (!outTruckImage) {
            notification.error({
              message: '¡No ha sido posible guardar la imagen correctamente!'
            });

            throw new Error('No ha sido posible guardar la imagen!');
          } else {
            notification.success({
              message: '¡La imagen ha sido subida exitosamente!'
            });
          }

          await client.mutate({
            mutation: TICKET_OUT_IMAGE_SUBMIT,
            variables: {
              ticket: { id: currentTicket.id, outTruckImage }
            }
          });

          form.resetFields();
          setCurrent();
        } catch (e) {
          this.setState({ loading: false });
          e.graphQLErrors.map(({ message }) =>
            notification.error(message, 'error', {
              duration: 3000,
              closeable: true
            })
          );
        }
      } else {
        this.setState({ loading: false });
        notification('No se ha podido actualizar correctamente', 'error', {
          duration: 3000,
          closeable: true
        });
      }
    });
  };

  captureImage = () => {
    const outTruckImage = this.camRef.current.getScreenshot();

    this.setState({ outTruckImage });
  };

  removeImage = () => this.setState({ outTruckImage: '/static/images/truck_image.png' });

  handleCancel = () => {
    const { setCurrent } = this.props;

    setCurrent();
  };

  render() {
    const { currentTicket, currentForm } = this.props;
    const { loading, outTruckImage } = this.state;

    return (
      <Modal
        title={`${currentTicket.truck.plates}`}
        visible={currentForm === 'image'}
        onCancel={this.handleCancel}
        footer={null}
        width="fit-content"
      >
        <Row display="flex" justify="start">
          <Col span={12}>
            <Webcam
              style={{
                height: '36vh',
                width: '48vh',
                margin: '0px 5px',
                padding: 0,
                borderRadius: 5
              }}
              ref={this.camRef}
              screenshotQuality={1}
              audio={false}
              imageSmoothing={true}
            />
          </Col>
          <Col span={12}>
            {!outTruckImage ? (
              <PreviewImageContainer>
                <Icon style={{ fontSize: 30 }} type="file-image" />
              </PreviewImageContainer>
            ) : (
              <ImageContainer alt="Preview" src={outTruckImage} />
            )}
          </Col>
        </Row>
        <Row>
          <Button style={{ margin: 5 }} type="default" onClick={this.captureImage}>
            Capturar
          </Button>
          {outTruckImage && (
            <>
              <Button style={{ margin: 5 }} type="danger" onClick={this.removeImage}>
                Cancelar
              </Button>
              <Button
                style={{ margin: 5 }}
                type="primary"
                onClick={this.handleSubmit}
                loading={loading}
              >
                {(loading && 'Espere..') || 'OK'}
              </Button>
            </>
          )}
        </Row>
      </Modal>
    );
  }
}

export default withApollo(TicketImageForm);
