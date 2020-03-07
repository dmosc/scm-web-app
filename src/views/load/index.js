import React from 'react';
import Container from 'components/common/container';
import TrucksList from './components/trucks-list';
import LoadContainer from './elements';
import LoadedTruckList from './components/loaded-trucks-list';

const Load = () => {
  return (
    <LoadContainer>
      <Container title="Camiones activos" margin="20px" width="60%">
        <TrucksList />
      </Container>
      <Container title="Camiones servidos" margin="20px" width="40%">
        <LoadedTruckList />
      </Container>
    </LoadContainer>
  );
};

export default Load;
