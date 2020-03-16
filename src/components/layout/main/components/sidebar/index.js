import React from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'antd';
import { withRouter, Link } from 'react-router-dom';
import { useAuth } from 'components/providers/withAuth';
import { Menu, Sider } from './elements';

const { Item, SubMenu, ItemGroup } = Menu;

const Sidebar = ({ history, collapsed, onCollapse }) => {
  const { isAdmin, isCashier, isLoader, isGuard, isAccountant } = useAuth();

  return (
    <Sider theme="light" collapsible collapsed={collapsed} onCollapse={onCollapse}>
      <Menu
        theme="light"
        defaultSelectedKeys={history.location.pathname.toLowerCase()}
        selectedKeys={history.location.pathname.toLowerCase()}
        mode="inline"
      >
        {(isAdmin || isCashier || isAccountant) && (
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
        {(isAdmin || isLoader) && (
          <Item key="cargas">
            <Link to="/cargas">
              <Icon type="funnel-plot" />
              <span>Cargas</span>
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
        {(isAdmin || isCashier || isAccountant) && (
          <SubMenu
            title={
              <span className="submenu-title-wrapper">
                <Icon type="cloud-upload" />
                <span>Registros</span>
              </span>
            }
          >
            <ItemGroup title="Clientes">
              {(isAdmin || isCashier) && (
                <Item key="registros/clientes">
                  <Link to="/registros/clientes">
                    <Icon type="usergroup-add" />
                    Clientes
                  </Link>
                </Item>
              )}
              {(isAdmin || isAccountant) && (
                <Item key="registros/peticiones-clientes">
                  <Link to="/registros/peticiones-clientes">
                    <Icon type="form" />
                    Peticiones
                  </Link>
                </Item>
              )}
            </ItemGroup>
            {(isAdmin || isCashier) && (
              <ItemGroup title="Camiones">
                <Item key="registros/camiones">
                  <Link to="/registros/camiones">
                    <Icon type="car" />
                    Camiones
                  </Link>
                </Item>
              </ItemGroup>
            )}
            {isAdmin && (
              <ItemGroup title="Usuarios">
                <Item key="registros/usuarios">
                  <Link to="/registros/usuarios">
                    <Icon type="user-add" />
                    Usuarios
                  </Link>
                </Item>
              </ItemGroup>
            )}
            <ItemGroup title="Productos">
              {(isAdmin || isCashier || isAccountant) && (
                <Item key="registros/productos">
                  <Link to="/registros/productos">
                    <Icon type="star" />
                    Productos
                  </Link>
                </Item>
              )}
              {(isAdmin || isAccountant) && (
                <Item key="registros/peticiones-productos">
                  <Link to="/registros/peticiones-productos">
                    <Icon type="form" />
                    Peticiones
                  </Link>
                </Item>
              )}
            </ItemGroup>
          </SubMenu>
        )}
        {isAdmin && (
          <Item key="reportes">
            <Link to="/reportes">
              <Icon type="line-chart" />
              <span>Reportes</span>
            </Link>
          </Item>
        )}
        {isAdmin && (
          <Item key="historial">
            <Link to="/historial">
              <Icon type="history" />
              <span>Historial</span>
            </Link>
          </Item>
        )}
        {(isAdmin || isCashier || isGuard || isAccountant) && (
          <Item key="mensajes">
            <Link to="/mensajes">
              <Icon type="message" />
              <span>Mensajes</span>
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
