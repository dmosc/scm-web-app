import React, { useEffect, useState } from 'react';
import { withApollo } from '@apollo/react-hoc';
import PropTypes from 'prop-types';
import { Button, Form } from 'antd';
import { Time, TimesContainer, TitleTime } from './elements';
import TurnSummary from './components/turn-summary';
import { GET_PRODUCTION_TURN_SUMMARY } from './graphql/queries';

const TurnEndForm = ({ client, productionTurn, setProductionTurn }) => {
  const [productionTurnSummary, setProductionTurnSummary] = useState(undefined);
  const [showSummary, setShowSummary] = useState(false);
  const [end, setEnd] = useState(new Date());

  useEffect(() => {
    const clockId = setInterval(() => {
      setEnd(new Date());
    }, 1000);
    return () => clearInterval(clockId);
  }, []);

  const getProductionSummary = async () => {
    const { data } = await client.query({
      query: GET_PRODUCTION_TURN_SUMMARY,
      variables: { id: productionTurn.id }
    });

    setProductionTurnSummary(data.productionTurnSummary || undefined);
    setShowSummary(true);
  };

  return (
    <>
      <TimesContainer>
        <Time>
          <span>Turno empezó: </span>
          <TitleTime>{new Date(productionTurn.start).toLocaleTimeString()}</TitleTime>
        </Time>
        <Time>
          <span>Turno termina: </span>
          <TitleTime>{end.toLocaleTimeString()}</TitleTime>
        </Time>
      </TimesContainer>
      <Form.Item>
        <Button block icon="pie-chart" onClick={getProductionSummary}>
          Resumen
        </Button>
      </Form.Item>
      <TurnSummary
        productionTurnSummary={productionTurnSummary}
        productionTurn={productionTurn}
        showSummary={showSummary}
        setShowSummary={setShowSummary}
        setProductionTurn={setProductionTurn}
      />
    </>
  );
};

TurnEndForm.propTypes = {
  client: PropTypes.object.isRequired,
  productionTurn: PropTypes.object.isRequired,
  setProductionTurn: PropTypes.func.isRequired
};

export default withApollo(TurnEndForm);