import React from 'react';
import PropTypes from 'prop-types';
import TurnInitForm from './components/turn-init-form';
import TurnEndForm from './components/turn-end-form';
import { Card } from './elements';

const Turn = ({ productionTurn, setProductionTurn }) => {
  return (
    <Card>
      {!productionTurn && <TurnInitForm />}
      {productionTurn && (
        <TurnEndForm productionTurn={productionTurn} setProductionTurn={setProductionTurn} />
      )}
    </Card>
  );
};

Turn.defaultProps = {
  productionTurn: undefined
};

Turn.propTypes = {
  productionTurn: PropTypes.object,
  setProductionTurn: PropTypes.func.isRequired
};

export default Turn;
