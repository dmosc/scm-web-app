import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Tabs } from 'antd';
import LapStatus from './components/lap-status';
import ObservationsHistory from './components/observations-history';
import { Card } from './elements';

const { TabPane } = Tabs;

const Observations = ({ currentLap, setCurrentLap }) => {
  const [tab, setTab] = useState('status');

  return (
    <>
      {currentLap &&
      <Card>
        <Tabs animated={false} onChange={tabPane => setTab(tabPane)} defaultActiveKey="status">
          <TabPane tab="Estátus" key="status"/>
          <TabPane tab="Observaciones" key="observations"/>
        </Tabs>
        {tab === 'status' && <LapStatus currentLap={currentLap} setCurrentLap={setCurrentLap}/>}
        {tab === 'observations' && <ObservationsHistory currentLap={currentLap} setCurrentLap={setCurrentLap}/>}
      </Card>}
    </>
  );
};

Observations.defaultProps = {
  currentLap: undefined
};

Observations.propTypes = {
  currentLap: PropTypes.object,
  setCurrentLap: PropTypes.func.isRequired
};

export default Observations;