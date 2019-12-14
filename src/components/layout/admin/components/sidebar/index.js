import React from 'react';
import {Layout as Layer} from 'antd';
import Menu from 'components/common/menu';

const {Sider} = Layer;

const Sidebar = ({collapsed, onCollapse}) => {
  return (
    <Sider
      theme="light"
      collapsible
      collapsed={collapsed}
      onCollapse={onCollapse}
    >
      <Menu
        items={[
          {icon: 'dashboard', title: 'Dashboard'},
          {icon: 'unordered-list', title: 'Boletas'},
          {icon: 'cloud-upload', title: 'Registros'},
          {icon: 'dollar', title: 'Transacciones'},
          {icon: 'history', title: 'Historial'},
          {icon: 'message', title: 'Mensajes'},
        ]}
        mode="inline"
      />
    </Sider>
  );
};

export default Sidebar;
