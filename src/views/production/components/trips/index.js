import React, { useEffect, useState } from 'react';
import { useQuery, useSubscription } from '@apollo/react-hooks';
import { withAuth } from 'components/providers/withAuth';
import Turn from './components/turn';
import TripsList from './components/trips-list';
import { TripsContainer } from './elements';
import { GET_ACTIVE_PRODUCTION_TURN } from './graphql/queries';
import { PRODUCTION_TURN_UPDATE } from './graphql/subscriptions';

const Trips = () => {
  const [productionTurn, setProductionTurn] = useState(undefined);
  const activeProductionTurn = useQuery(GET_ACTIVE_PRODUCTION_TURN);

  useEffect(() => {
    const { data } = activeProductionTurn;
    if (data?.productionTurnActive) {
      setProductionTurn(data?.productionTurnActive);
    }
  }, [activeProductionTurn]);

  useSubscription(PRODUCTION_TURN_UPDATE, {
    onSubscriptionData: ({ subscriptionData }) => {
      const { productionTurnUpdate } = subscriptionData.data;

      if (productionTurnUpdate.end) {
        setProductionTurn(undefined);
      } else {
        setProductionTurn(productionTurnUpdate);
      }
    }
  });

  return (
    <TripsContainer>
      <Turn productionTurn={productionTurn} setProductionTurn={setProductionTurn} />
      <TripsList productionTurn={productionTurn} />
    </TripsContainer>
  );
};

export default withAuth(Trips);
