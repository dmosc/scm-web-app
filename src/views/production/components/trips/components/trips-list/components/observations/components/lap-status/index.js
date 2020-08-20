import React, { useEffect, useState } from 'react';
import { useMutation } from '@apollo/react-hooks';
import PropTypes from 'prop-types';
import { Button, message, Modal, Tag, Typography } from 'antd';
import { ButtonContainer, Card, LineContainer, TitleContainer } from './elements';
import { CANCEL_LAP, LAP_END } from './graphql/mutations';

const { confirm } = Modal;
const { Title, Text } = Typography;

const LapStatus = ({ currentLap, setCurrentLap }) => {
  const [end, setEnd] = useState(new Date());
  const [lapEndMutation] = useMutation(LAP_END);
  const [cancelLapMutation] = useMutation(CANCEL_LAP);

  useEffect(() => {
    const clockId = setInterval(() => {
      setEnd(new Date());
    }, 1000);
    return () => clearInterval(clockId);
  }, []);

  const lapEnd = () => {
    confirm({
      title: '¿Estás seguro de que deseas terminar la vuelta?',
      content: 'Una vez terminada, ya no será posible modificarla',
      okType: 'danger',
      okText: 'Terminar',
      cancelText: 'Cancelar',
      onOk: async () => {
        try {
          const { errors } = await lapEndMutation({ variables: { lap: { id: currentLap.id } } });

          if (errors) {
            errors.forEach(error => message.error(error.message));
            return;
          }

          setCurrentLap(undefined);

          message.success('La vuelta ha sido registrada en el turno exitosamente!');
        } catch (e) {
          message.error('Ha habido un error terminando la vuelta!');
        }
      },
      onCancel: () => {}
    });
  };

  const lapCancel = () => {
    confirm({
      title: '¿Estás seguro de que deseas cancelar la vuelta?',
      content: 'Una vez cancelada, será registrada sin toneladas para el turno actual.',
      okType: 'danger',
      okText: 'Terminar',
      cancelText: 'Cancelar',
      onOk: async () => {
        try {
          const { errors } = await cancelLapMutation({ variables: { lap: { id: currentLap.id } } });

          if (errors) {
            errors.forEach(error => message.error(error.message));
            return;
          }

          setCurrentLap(undefined);

          message.success('La vuelta ha sido cancelada exitosamente!');
        } catch (e) {
          message.error('Ha habido un error cancelando la vuelta!');
        }
      },
      onCancel: () => {}
    });
  };

  const lapStart = new Date(currentLap?.start);
  const differenceInMinutes = (end - lapStart) / 60000;

  return (
    <Card>
      <TitleContainer>
        <Title level={3}>Bitácora de vuelta</Title>
        <ButtonContainer>
          <Button type="danger" icon="delete" onClick={lapCancel}>
            Cancelar
          </Button>
          <Button type="primary" icon="pull-request" onClick={lapEnd}>
            Terminar
          </Button>
        </ButtonContainer>
      </TitleContainer>
      <LineContainer>
        <Text strong>Inició: </Text>
        <Tag style={{ marginLeft: 10 }}>{new Date(currentLap.start).toLocaleTimeString()}</Tag>
      </LineContainer>
      <LineContainer>
        <Text strong>Termina: </Text>
        <Tag style={{ marginLeft: 10 }}>{end.toLocaleTimeString()}</Tag>
      </LineContainer>
      <LineContainer>
        <Text strong>Duración del viaje: </Text>
        <Tag style={{ marginLeft: 10 }} color="blue">{`${differenceInMinutes.toFixed(
          2
        )} minutos`}</Tag>
      </LineContainer>
    </Card>
  );
};

LapStatus.defaultProps = {
  currentLap: undefined
};

LapStatus.propTypes = {
  currentLap: PropTypes.object,
  setCurrentLap: PropTypes.func.isRequired
};

export default LapStatus;
