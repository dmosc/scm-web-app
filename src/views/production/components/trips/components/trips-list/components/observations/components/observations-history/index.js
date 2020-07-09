import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Form, Icon, Timeline, Tooltip, Typography } from 'antd';
import { useQuery } from '@apollo/react-hooks';
import { Card, ObservationsHistoryContainer } from './elements';
import { GET_OBSERVATION_ACTIVE } from './graphql/queries';
import ObservationForm from './components/observation-form';

const { Text } = Typography;

const ObservationsHistory = ({ currentLap, setCurrentLap }) => {
  const [currentObservation, setCurrentObservation] = useState(undefined);
  const isObservationActiveQuery = useQuery(GET_OBSERVATION_ACTIVE, {
    variables: { lap: currentLap.id },
    fetchPolicy: 'network-only'
  });

  useEffect(() => {
    const { data } = isObservationActiveQuery;

    setCurrentObservation(data?.observationActive ?? undefined);
  }, [isObservationActiveQuery]);

  const ObservationFormComponent = Form.create({ name: 'observation-form' })(ObservationForm);

  return (
    <ObservationsHistoryContainer>
      <ObservationFormComponent
        currentLap={currentLap}
        currentObservation={currentObservation}
        setCurrentLap={setCurrentLap}
        setCurrentObservation={setCurrentObservation}
      />
      <Card>
        <Timeline mode="right" style={{ overflow: 'scroll', padding: 5 }}>
          {currentLap.observations.length === 0 &&
          <Timeline.Item color="green">
            Aquí aparecerán las observaciones
          </Timeline.Item>}
          {currentLap.observations.length > 0 && currentLap.observations.map(observation => {
            if (!observation.end) return undefined;
            const observationStart = new Date(observation.start);
            const observationEnd = new Date(observation.end);
            const differenceInMinutes = ((observationEnd - observationStart) / 60000).toFixed(2);

            return (
              <Timeline.Item dot={<Icon type="clock-circle-o"/>} key={observation.id}>
                <Tooltip placement="top" title={observation.description}>
                  <Text strong>
                    {`De ${observationStart.toLocaleTimeString()} a ${observationEnd.toLocaleTimeString()} - ${differenceInMinutes} minutos`}
                  </Text>
                </Tooltip>
              </Timeline.Item>
            );
          })}
        </Timeline>
      </Card>
    </ObservationsHistoryContainer>
  );
};

ObservationsHistory.defaultProps = {
  currentLap: undefined
};

ObservationsHistory.propTypes = {
  currentLap: PropTypes.object,
  setCurrentLap: PropTypes.func.isRequired
};

export default ObservationsHistory;