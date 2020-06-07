import React from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'antd';
import { Link, withRouter } from 'react-router-dom';
import { useAuth } from 'components/providers/withAuth';
import { Menu, Sider } from './elements';

const { Item, SubMenu, ItemGroup } = Menu;

const Sidebar = ({ history, location, collapsed, onCollapse }) => {
  const { isAdmin, isGuard, isLoader, isCashier, isAccountant, isManager, isSupport } = useAuth();

  return (
    <Sider theme="light" collapsible collapsed={collapsed} onCollapse={onCollapse}>
      <Menu
        theme="light"
        defaultSelectedKeys={history.location.pathname.toLowerCase()}
        selectedKeys={history.location.pathname.toLowerCase()}
        mode="inline"
      >
        <Item key="dashboard">
          <Link to="/dashboard">
            <Icon type="dashboard" />
            <span>Dashboard</span>
          </Link>
        </Item>
        {(isAdmin || isGuard || isSupport || isManager) && (
          <Item key="accesos">
            <Link to="/accesos">
              <Icon type="key" />
              <span>Accesos</span>
            </Link>
          </Item>
        )}
        {(isAdmin || isLoader || isSupport || isManager) && (
          <Item key="cargas">
            <Link to="/cargas">
              <Icon type="funnel-plot" />
              <span>Cargas</span>
            </Link>
          </Item>
        )}
        {(isAdmin || isCashier || isSupport || isManager) && (
          <Item key={location.pathname === '/boletas' ? 'boletas' : undefined}>
            <Link to="/boletas">
              <Icon type="unordered-list" />
              <span>Boletas</span>
            </Link>
          </Item>
        )}
        {(isAdmin || isAccountant || isSupport || isManager) && (
          <SubMenu
            title={
              <span className="submenu-title-wrapper">
                <Icon type="cloud-upload" />
                <span>Registros</span>
              </span>
            }
          >
            <ItemGroup title="Clientes">
              {(isAdmin || isAccountant || isSupport || isManager) && (
                <Item key="registros/clientes">
                  <Link to="/registros/clientes">
                    <Icon type="user" />
                    Clientes
                  </Link>
                </Item>
              )}
              {(isAdmin || isAccountant || isSupport || isManager) && (
                <Item key="registros/peticiones-clientes">
                  <Link to="/registros/peticiones-clientes">
                    <Icon type="form" />
                    Peticiones
                  </Link>
                </Item>
              )}
              {(isAdmin || isSupport || isManager) && (
                <Item key="registros/grupos">
                  <Link to="/registros/grupos">
                    <Icon type="team" />
                    Grupos
                  </Link>
                </Item>
              )}
            </ItemGroup>
            {(isAdmin || isAccountant || isSupport || isManager) && (
              <ItemGroup title="Camiones">
                <Item key="registros/camiones">
                  <Link to="/registros/camiones">
                    <Icon type="car" />
                    Camiones
                  </Link>
                </Item>
              </ItemGroup>
            )}
            {(isAdmin || isAccountant || isSupport || isManager) && (
              <ItemGroup title="Usuarios">
                <Item key="registros/usuarios">
                  <Link to="/registros/usuarios">
                    <Icon type="user" />
                    Usuarios
                  </Link>
                </Item>
              </ItemGroup>
            )}
            <ItemGroup title="Productos">
              {(isAdmin || isAccountant || isSupport || isManager) && (
                <Item key="registros/productos">
                  <Link to="/registros/productos">
                    <Icon type="block" />
                    Productos
                  </Link>
                </Item>
              )}
              {(isAdmin || isAccountant || isSupport || isManager) && (
                <Item key="registros/peticiones-productos">
                  <Link to="/registros/peticiones-productos">
                    <Icon type="form" />
                    Peticiones
                  </Link>
                </Item>
              )}
            </ItemGroup>
            <ItemGroup title="Promociones">
              {(isAdmin || isAccountant || isSupport || isManager) && (
                <Item key="registros/promociones">
                  <Link to="/registros/promociones">
                    <Icon type="scissor" />
                    Promociones
                  </Link>
                </Item>
              )}
            </ItemGroup>
            <ItemGroup title="Máquinas">
              {(isAdmin || isAccountant || isSupport || isManager) && (
                <Item key="registros/maquinas">
                  <Link to="/registros/maquinas">
                    <Icon type="robot" />
                    Máquinas
                  </Link>
                </Item>
              )}
              {(isAdmin || isAccountant || isSupport || isManager) && (
                <Item key="registros/diesel">
                  <Link to="/registros/diesel">
                    <Icon type="share-alt" />
                    Diésel
                  </Link>
                </Item>
              )}
              {(isAdmin || isAccountant || isSupport || isManager) && (
                <Item key="registros/aceite">
                  <Link to="/registros/aceite">
                    <Icon type="deployment-unit" />
                    Aceite
                  </Link>
                </Item>
              )}
            </ItemGroup>
          </SubMenu>
        )}
        {(isAdmin || isAccountant || isSupport || isManager) && (
          <SubMenu
            title={
              <span className="submenu-title-wrapper">
                <Icon type="line-chart" />
                <span>Reportes</span>
              </span>
            }
          >
            <Item key="reportes/productos">
              <Link to="/reportes/productos">
                <Icon type="block" />
                Productos
              </Link>
            </Item>
            <Item key="reportes/boletas">
              <Link to="/reportes/boletas">
                <Icon type="unordered-list" />
                Boletas
              </Link>
            </Item>
            <Item key="reportes/clientes">
              <Link to="/reportes/clientes">
                <Icon type="usergroup-add" />
                Clientes
              </Link>
            </Item>
            <Item key="reportes/turnos">
              <Link to="/reportes/turnos">
                <Icon type="file-done" />
                Turnos
              </Link>
            </Item>
            <Item key="reportes/ventas">
              <Link to="/reportes/ventas">
                <Icon type="dollar" />
                Ventas
              </Link>
            </Item>
            <Item key="reportes/tiempos">
              <Link to="/reportes/tiempos">
                <Icon type="clock-circle" />
                Tiempos
              </Link>
            </Item>
          </SubMenu>
        )}
        {(isAdmin || isManager || isAccountant) && (
          <SubMenu
            title={
              <span className="submenu-title-wrapper">
                <Icon type="dollar" />
                <span>Ventas</span>
              </span>
            }
          >
            <Item key="ventas/cotizaciones">
              <Link to="/ventas/cotizaciones">
                <Icon type="file-protect" />
                <span>Cotizaciones</span>
              </Link>
            </Item>
            <Item key="ventas/seguimiento">
              <Link to="/ventas/seguimiento">
                <Icon type="eye"/>
                <span>Seguimiento</span>
              </Link>
            </Item>
          </SubMenu>
        )}
        {(isAdmin || isAccountant || isManager || isCashier) && (
          <SubMenu
            title={
              <span className="submenu-title-wrapper">
                <Icon type="file-text"/>
                <span>Facturas</span>
              </span>
            }
          >
            <Item key="facturas/agrupador">
              <Link to="/facturas/agrupador">
                <Icon type="shrink" />
                <span>Agrupador</span>
              </Link>
            </Item>
            {(!isCashier) && <Item key="facturas/registros">
              <Link to="/facturas/registros">
                <Icon type="read"/>
                Registros
              </Link>
            </Item>}
          </SubMenu>
        )}
        {(isAdmin || isManager || isSupport) && (
          <Item key="produccion">
            <Link to="/produccion">
              <Icon type="experiment"/>
              <span>Producción</span>
            </Link>
          </Item>
        )}
        {(isAdmin || isAccountant || isSupport || isManager) && (
          <Item key="historial">
            <Link to="/historial">
              <Icon type="history"/>
              <span>Historial</span>
            </Link>
          </Item>
        )}
        {(isAdmin || isAccountant || isSupport || isManager || isLoader || isCashier) && (
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
  location: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  collapsed: PropTypes.bool.isRequired,
  onCollapse: PropTypes.func.isRequired
};

export default withRouter(Sidebar);
