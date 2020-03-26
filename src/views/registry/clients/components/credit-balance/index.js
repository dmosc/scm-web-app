import React, { useState } from 'react';
import { Modal, Tabs } from 'antd';
import PropTypes from 'prop-types';
import HistoryCredit from './components/history-credit';
import CreditStatus from './components/credit-status';

const { TabPane } = Tabs;

const CreditBalance = ({ currentClient, close }) => {
  const [tab, setTab] = useState('status');

  return (
    <Modal
      title={`Precios especiales de ${currentClient.businessName}`}
      visible
      cancelButtonProps={{ style: { display: 'none' } }}
      onCancel={close}
      onOk={close}
      width={650}
      footer={null}
    >
      <Tabs animated={false} onChange={tabPane => setTab(tabPane)} defaultActiveKey="edit">
        <TabPane tab="Status del balance" key="status" />
        <TabPane tab="Historial de cambios a límite de crédito" key="history" />
      </Tabs>
      {tab === 'status' && <CreditStatus currentClient={currentClient} />}
      {tab === 'history' && <HistoryCredit currentClient={currentClient} />}
    </Modal>
  );
};

CreditBalance.propTypes = {
  currentClient: PropTypes.object.isRequired,
  close: PropTypes.func.isRequired
};

export default CreditBalance;
