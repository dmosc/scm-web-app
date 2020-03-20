import React, { useState } from 'react';
import { Modal, Tabs } from 'antd';
import PropTypes from 'prop-types';
import EditSpecialPrices from './components/edit-special-prices';
import HistorySpecialPrices from './components/history-special-prices';

const { TabPane } = Tabs;

const PriceRequests = ({ currentClient, close }) => {
  const [tab, setTab] = useState('edit');

  return (
    <Modal
      title={`Precios especiales de ${currentClient.businessName}`}
      visible
      cancelButtonProps={{ style: { display: 'none' } }}
      onCancel={close}
      onOk={close}
      width={800}
    >
      <Tabs animated={false} onChange={tabPane => setTab(tabPane)} defaultActiveKey="edit">
        <TabPane tab="Editar precios" key="edit" />
        <TabPane tab="Historial" key="history" />
      </Tabs>
      {tab === 'edit' && <EditSpecialPrices currentClient={currentClient} />}
      {tab === 'history' && <HistorySpecialPrices currentClient={currentClient} />}
    </Modal>
  );
};

PriceRequests.propTypes = {
  currentClient: PropTypes.object.isRequired,
  close: PropTypes.func.isRequired
};

export default PriceRequests;
