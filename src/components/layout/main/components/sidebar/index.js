import React from 'react';
import PropTypes from 'prop-types';
import { Layout as Layer, Menu, Icon } from 'antd';
import { withRouter, Link } from 'react-router-dom';
import { useAuth } from 'components/providers/withAuth';

const { Item, SubMenu } = Menu;
const { Sider } = Layer;

const Sidebar = ({ history, collapsed, onCollapse }) => {
  const { isAdmin, isCashier, isGuard } = useAuth();

  return (
    <Sider theme="light" collapsible collapsed={collapsed} onCollapse={onCollapse}>
      <Menu
        theme="light"
        defaultSelectedKeys={history.location.pathname.toLowerCase()}
        selectedKeys={history.location.pathname.toLowerCase()}
        mode="inline"
      >
        {(isAdmin || isCashier) && (
          <Item key="dashboard">
            <Link to="/dashboard">
              <Icon type="dashboard" />
              <span>Dashboard</span>
            </Link>
          </Item>
        )}
        {(isAdmin || isGuard) && (
          <Item key="accesos">
            <Link to="/accesos">
              <Icon type="key" />
              <span>Accesos</span>
            </Link>
          </Item>
        )}
        {(isAdmin || isCashier) && (
          <Item key="boletas">
            <Link to="/boletas">
              <Icon type="unordered-list" />
              <span>Boletas</span>
            </Link>
          </Item>
        )}
        {(isAdmin || isCashier) && (
          <SubMenu
            title={
              <span className="submenu-title-wrapper">
                <Icon type="cloud-upload" />
                Registros
              </span>
            }
          >
            <Item key="registros/clientes">
              <Link to="/registros/clientes">
                <Icon type="usergroup-add" />
                Clientes
              </Link>
            </Item>
            <Item key="registros/camiones">
              <Link to="/registros/camiones">
                <Icon type="car" />
                Camiones
              </Link>
            </Item>
            {isAdmin && (
              <Item key="registros/usuarios">
                <Link to="/registros/usuarios">
                  <Icon type="user-add" />
                  Usuarios
                </Link>
              </Item>
            )}
            {isAdmin && (
              <Item key="registros/productos">
                <Link to="/registros/productos">
                  <Icon type="star" />
                  Productos
                </Link>
              </Item>
            )}
          </SubMenu>
        )}
        {(isAdmin || isCashier || isGuard) && (
          <Item key="historial">
            <Link to="/historial">
              <Icon type="history" />
              <span>Historial</span>
            </Link>
          </Item>
        )}
        {(isAdmin || isCashier || isGuard) && (
          <Item key="mensajes">
            <Link to="/mensajes">
              <Icon type="message" />
              <span>Mensages</span>
            </Link>
          </Item>
        )}
      </Menu>
    </Sider>
  );
};

Sidebar.propTypes = {
  history: PropTypes.object.isRequired,
  collapsed: PropTypes.bool.isRequired,
  onCollapse: PropTypes.func.isRequired
};

export default withRouter(Sidebar);
