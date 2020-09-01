import React, { useEffect, useState } from 'react';
import { Button, Form, message, Typography } from 'antd';
import { useMutation } from '@apollo/react-hooks';
import { INIT_PRODUCTION_TURN } from './graphql/mutations';

const { Title } = Typography;

const TurnInitForm = () => {
  const [loading, setLoading] = useState(false);
  const [start, setStart] = useState(new Date());
  const [productionTurnInit] = useMutation(INIT_PRODUCTION_TURN);

  useEffect(() => {
    const clockId = setInterval(() => {
      setStart(new Date());
    }, 1000);
    return () => clearInterval(clockId);
  }, []);

  const handleSubmit = async e => {
    setLoading(true);
    e.preventDefault();

    try {
      await productionTurnInit({});
    } catch (error) {
      message.error(error.message);
    }

    setLoading(false);
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Item>
        <span>Turno empieza: </span>
        <Title>{start.toLocaleTimeString()}</Title>
      </Form.Item>
      <Form.Item>
        <Button block type="primary" htmlType="submit" icon="caret-right" loading={loading}>
          {(loading && 'Espere..') || 'Iniciar turno'}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default TurnInitForm;
