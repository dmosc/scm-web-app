import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Descriptions, Typography } from 'antd';

const { Title } = Typography;

const Turn = ({ turn }) => {
  return (
    <>
      <Title style={{ marginBottom: 20 }} level={4}>
        Turno
      </Title>
      <Descriptions size="small" column={2}>
        <Descriptions.Item label="Operado por">
          {turn.user.firstName} {turn.user.lastName}
        </Descriptions.Item>
        <Descriptions.Item label="Periodo">{turn.period}</Descriptions.Item>
        <Descriptions.Item label="Inicio">{moment(turn.start).format('LLL')}</Descriptions.Item>
        <Descriptions.Item label="Fin">{moment(turn.end).format('LLL')}</Descriptions.Item>
      </Descriptions>
    </>
  );
};

Turn.propTypes = {
  turn: PropTypes.shape({
    period: PropTypes.string,
    start: PropTypes.any,
    end: PropTypes.any,
    user: PropTypes.shape({
      firstName: PropTypes.string,
      lastName: PropTypes.string
    })
  }).isRequired
};

export default Turn;
