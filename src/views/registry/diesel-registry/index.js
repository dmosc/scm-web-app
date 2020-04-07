import React, { useState } from 'react';
import { Button, Tabs, Typography } from 'antd';
import { Card, ListContainer, TitleContainer } from './elements';
import MachineDieselLoadList from './components/machine-diesel-load-list';
import TankDieselLoadList from './components/tank-diesel-load-list';

const { Title } = Typography;
const { TabPane } = Tabs;

const DieselRegistry = () => {
  const [tab, setTab] = useState('salidas');
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <ListContainer>
      <TitleContainer>
        <Title level={3}>Historial de Diésel</Title>
        <Button onClick={() => setIsModalOpen(true)} type="primary" icon="form">
          {`Registrar ${tab === 'salidas' ? 'salida' : 'entrada'}`}
        </Button>
      </TitleContainer>
      <Card>
        <Tabs animated={false} onChange={tabPane => setTab(tabPane)} defaultActiveKey="edit">
          <TabPane tab="Salidas" key="salidas" />
          <TabPane tab="Entradas" key="entradas" />
        </Tabs>
        {tab === 'salidas' && (
          <MachineDieselLoadList
            tab={tab}
            isModalOpen={isModalOpen}
            setIsModalOpen={setIsModalOpen}
          />
        )}
        {tab === 'entradas' && (
          <TankDieselLoadList tab={tab} isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} />
        )}
      </Card>
    </ListContainer>
  );
};

export default DieselRegistry;
