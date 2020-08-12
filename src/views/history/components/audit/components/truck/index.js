import React from 'react';
import PropTypes from 'prop-types';
import { Descriptions, Typography, Row, Col, Button } from 'antd';

const { Title, Paragraph } = Typography;

const Truck = ({
  truck,
  driver,
  inTruckImage,
  inTruckImageLeft,
  inTruckImageRight,
  outTruckImage,
  outTruckImageBack
}) => {
  return (
    <>
      <Title style={{ marginBottom: 20 }} level={4}>
        Camión
      </Title>
      <Descriptions size="small" column={2}>
        <Descriptions.Item label="Placas">{truck.plates}</Descriptions.Item>
        <Descriptions.Item label="Marca">{truck.brand}</Descriptions.Item>
        <Descriptions.Item label="Modelo">{truck.model}</Descriptions.Item>
        <Descriptions.Item label="Peso">{truck.weight}</Descriptions.Item>
        <Descriptions.Item label="Conductor">{driver}</Descriptions.Item>
      </Descriptions>
      <Row>
        <Col span={12}>
          <Paragraph strong>Entrada</Paragraph>
          <Button
            icon="login"
            style={{ marginRight: 10 }}
            size="small"
            type="primary"
            onClick={() => window.open(inTruckImageLeft, '_blank')}
            disabled={!inTruckImageLeft}
          >
            Izquierda
          </Button>
          <Button
            icon="login"
            style={{ marginRight: 10 }}
            size="small"
            type="primary"
            onClick={() => window.open(inTruckImage, '_blank')}
            disabled={!inTruckImage}
          >
            Arriba
          </Button>
          <Button
            icon="login"
            style={{ marginRight: 10 }}
            size="small"
            type="primary"
            onClick={() => window.open(inTruckImageRight, '_blank')}
            disabled={!inTruckImageRight}
          >
            Derecha
          </Button>
        </Col>
        <Col span={12}>
          <Paragraph strong>Salida</Paragraph>
          <Button
            size="small"
            icon="logout"
            type="primary"
            onClick={() => window.open(outTruckImage, '_blank')}
            disabled={!outTruckImage}
          >
            Frente
          </Button>
          <Button
            size="small"
            icon="logout"
            type="primary"
            onClick={() => window.open(outTruckImageBack, '_blank')}
            disabled={!outTruckImageBack}
          >
            Atrás
          </Button>
        </Col>
      </Row>
    </>
  );
};

Truck.defaultProps = {
  inTruckImage: '',
  inTruckImageLeft: '',
  inTruckImageRight: '',
  outTruckImage: '',
  outTruckImageBack: ''
};

Truck.propTypes = {
  truck: PropTypes.shape({
    plates: PropTypes.string,
    brand: PropTypes.string,
    model: PropTypes.string,
    weight: PropTypes.number
  }).isRequired,
  driver: PropTypes.string.isRequired,
  inTruckImage: PropTypes.string,
  inTruckImageLeft: PropTypes.string,
  inTruckImageRight: PropTypes.string,
  outTruckImage: PropTypes.string,
  outTruckImageBack: PropTypes.string
};

export default Truck;
