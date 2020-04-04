import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Form, Modal, Tabs } from 'antd';
import StoreForm from './components/store-form';
import StoresList from './components/stores-list';

const { TabPane } = Tabs;

const Stores = ({ currentClient, close }) => {
  const [tab, setTab] = useState('store-form');
  const [currentStore, setCurrentStore] = useState(null);

  const StoreCreateForm = Form.create({ name: 'store' })(StoreForm);

  useEffect(() => {
    if (currentStore) setTab('store-form');
  }, [currentStore]);

  const setTabPane = tabPane => {
    if (tabPane === 'stores-list') setCurrentStore(null);
    setTab(tabPane);
  };

  return (
    <Modal
      title={`Sucursales de ${currentClient.businessName}`}
      visible
      cancelButtonProps={{ style: { display: 'none' } }}
      onCancel={close}
      onOk={close}
      width={650}
      footer={null}
    >
      <Tabs animated={false} onChange={setTabPane} defaultActiveKey="store-form" activeKey={tab}>
        <TabPane
          tab={!currentStore ? 'Nueva sucursal' : `Editando sucursal ${currentStore.name}`}
          key="store-form"
        />
        <TabPane tab="Lista de sucursales" key="stores-list" />
      </Tabs>
      {tab === 'store-form' && (
        <StoreCreateForm
          currentClient={currentClient}
          currentStore={currentStore}
          setCurrentStore={setCurrentStore}
        />
      )}
      {tab === 'stores-list' && (
        <StoresList
          currentClient={currentClient}
          setCurrentStore={setCurrentStore}
          setTab={setTab}
        />
      )}
    </Modal>
  );
};

Stores.propTypes = {
  currentClient: PropTypes.object.isRequired,
  close: PropTypes.func.isRequired
};

export default Stores;
