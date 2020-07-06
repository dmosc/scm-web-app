import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Collapse, Tag, Typography } from 'antd';
import { useQuery, useSubscription } from '@apollo/react-hooks';
import Observations from './components/observations';
import LapFormInit from './components/lap-form-init';
import { Card, LineContainer, TitleContainer, TripsListContainer } from './elements';
import { GET_ACTIVE_LAPS, GET_LAP_ACTIVE } from './graphql/queries';
import { ACTIVE_LAPS } from './graphql/subscriptions';

const { Panel } = Collapse;
const { Title, Text } = Typography;

const TripsList = ({ productionTurn }) => {
  const [currentLap, setCurrentLap] = useState(undefined);
  const [activeLaps, setActiveLaps] = useState([]);
  const [showNewTripModal, setShowNewTripModal] = useState(false);
  const isLapActiveQuery = useQuery(GET_LAP_ACTIVE, { fetchPolicy: 'network-only' });
  const activeLapsQuery = useQuery(GET_ACTIVE_LAPS, { fetchPolicy: 'network-only' });

  useSubscription(ACTIVE_LAPS, {
    onSubscriptionData: ({ subscriptionData }) => {
      const { activeLaps: activeLapsToSet } = subscriptionData.data;
      setActiveLaps(activeLapsToSet ?? []);
    }
  });

  useEffect(() => {
    const { data } = isLapActiveQuery;
    setCurrentLap(data?.lapActive ?? undefined);
  }, [isLapActiveQuery]);

  useEffect(() => {
    const { data } = activeLapsQuery;
    setActiveLaps(data?.activeLaps ?? []);
  }, [activeLapsQuery]);

  return (
    <TripsListContainer currentLap={currentLap}>
      <Card>
        <TitleContainer>
          <Title level={3}>
            {activeLaps.length > 0 ? 'Vueltas activas' : 'No hay vueltas activas...'}
          </Title>
          <Button
            type="primary"
            icon="pull-request"
            disabled={!productionTurn || currentLap}
            onClick={() => setShowNewTripModal(true)}
          >
            Iniciar vuelta
          </Button>
        </TitleContainer>
        {activeLaps.length > 0 && <Collapse
          accordion
          style={{ overflowY: 'scroll' }}
        >
          {activeLaps.map(lap => {
            const lapStart = new Date(lap.start);
            return (
              <Panel
                key={lap.id}
                header={`Desde: ${lapStart.toLocaleTimeString()}`}
                extra={<Tag color="orange">{`${lap.tons} tons`}</Tag>}
              >
                <LineContainer>
                  <Text>{`Conductor: ${lap.driver.firstName} ${lap.driver.lastName}`}</Text>
                </LineContainer>
                <LineContainer>
                  <Text>{`Máquina: ${lap.machine.name}`}</Text>
                </LineContainer>
                <LineContainer>
                  <Text>{`Tipo: ${lap.machine.type}`}</Text>
                </LineContainer>
              </Panel>
            );
          })}
        </Collapse>}
      </Card>
      <Observations
        currentLap={currentLap}
        setCurrentLap={setCurrentLap}
      />
      <LapFormInit
        showNewTripModal={showNewTripModal}
        setShowNewTripModal={setShowNewTripModal}
        setCurrentLap={setCurrentLap}
      />
    </TripsListContainer>
  );
};

TripsList.defaultProps = {
  productionTurn: undefined
};

TripsList.propTypes = {
  productionTurn: PropTypes.object
};

export default TripsList;