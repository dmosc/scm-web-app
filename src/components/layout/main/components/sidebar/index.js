import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'antd';
import { Link, withRouter } from 'react-router-dom';
import { useAuth } from 'components/providers/withAuth';
import { sizes } from 'theme';
import { Menu, Sider } from './elements';

const { Item, SubMenu, ItemGroup } = Menu;

const Sidebar = ({ history, location, collapsed, onCollapse }) => {
  const { isAdmin, isGuard, isLoader, isCashier, isAccountant, isManager, isSupport, isCollector, isCollectorAux, isSales, isTreasurer, isAuditor, isDriver } = useAuth();
  const [isLg, toggleLg] = useState(window.innerWidth > sizes.lg);

  const updateWidth = () => {
    toggleLg(window.innerWidth > sizes.lg);
  };

  useEffect(() => {
    window.addEventListener('resize', updateWidth);

    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  return (
    <Sider
      breakpoint="lg"
      collapsedWidth={isLg ? '80' : '0'}
      theme="light"
      collapsed={collapsed}
      collapsible
      onCollapse={onCollapse}
    >
      <Menu
        theme="light"
        defaultSelectedKeys={history.location.pathname.toLowerCase()}
        selectedKeys={history.location.pathname.toLowerCase()}
        mode="inline"
      >
        {!isAuditor && <Item key="dashboard">
          <Link to="/dashboard">
            <Icon type="dashboard"/>
            <span>Dashboard</span>
          </Link>
        </Item>}
        {(isAdmin || isGuard || isSupport || isManager || isCashier || isCollector || isCollectorAux) && (
          <Item key="accesos">
            <Link to="/accesos">
              <Icon type="key"/>
              <span>Accesos</span>
            </Link>
          </Item>
        )}
        {(isAdmin || isLoader || isSupport || isManager) && (
          <Item key="cargas">
            <Link to="/cargas">
              <Icon type="funnel-plot"/>
              <span>Cargas</span>
            </Link>
          </Item>
        )}
        {(isAdmin || isCashier || isSupport || isManager || isCollector || isCollectorAux) && (
          <Item key={location.pathname === '/boletas' ? 'boletas' : undefined}>
            <Link to="/boletas">
              <Icon type="unordered-list"/>
              <span>Boletas</span>
            </Link>
          </Item>
        )}
        {(isAdmin || isSupport || isManager || isCollector || isCollectorAux || isSales) && (
          <SubMenu
            title={
              <span className="submenu-title-wrapper">
                <Icon type="cloud-upload"/>
                <span>Registros</span>
              </span>
            }
          >
            <ItemGroup title="Clientes">
              {(isAdmin || isAccountant || isSupport || isManager || isCollector || isCollectorAux) && (
                <Item key="registros/clientes">
                  <Link to="/registros/clientes">
                    <Icon type="user"/>
                    Clientes
                  </Link>
                </Item>
              )}
              {(isAdmin || isAccountant || isSupport || isManager || isCollector || isCollectorAux) && (
                <Item key="registros/peticiones-clientes">
                  <Link to="/registros/peticiones-clientes">
                    <Icon type="form"/>
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
            {(isAdmin || isAccountant || isSupport || isManager || isCollector || isCollectorAux) && (
              <ItemGroup title="Camiones">
                <Item key="registros/camiones">
                  <Link to="/registros/camiones">
                    <Icon type="car"/>
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
              {(isAdmin || isAccountant || isSupport || isManager || isCollector || isCollectorAux || isSales) && (
                <Item key="registros/productos">
                  <Link to="/registros/productos">
                    <Icon type="block"/>
                    Productos
                  </Link>
                </Item>
              )}
              {(isAdmin || isAccountant || isSupport || isManager || isCollector || isCollectorAux || isSales) && (
                <Item key="registros/peticiones-productos">
                  <Link to="/registros/peticiones-productos">
                    <Icon type="form"/>
                    Peticiones
                  </Link>
                </Item>
              )}
            </ItemGroup>
            <ItemGroup title="Promociones">
              {(isAdmin || isAccountant || isSupport || isManager || isCollector || isSales) && (
                <Item key="registros/promociones">
                  <Link to="/registros/promociones">
                    <Icon type="scissor"/>
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
                    <Icon type="deployment-unit"/>
                    Aceite
                  </Link>
                </Item>
              )}
            </ItemGroup>
          </SubMenu>
        )}
        {(isAdmin || isAccountant || isSupport || isManager || isCashier || isCollector || isCollectorAux || isSales || isTreasurer || isAuditor) && (
          <SubMenu
            title={
              <span className="submenu-title-wrapper">
                <Icon type="line-chart"/>
                <span>Reportes</span>
              </span>
            }
          >
            {(isAdmin || isManager || isSupport || isCollector || isCollectorAux || isSales || isAccountant || isTreasurer) &&
            <Item key="reportes/productos">
              <Link to="/reportes/productos">
                <Icon type="block"/>
                Productos
              </Link>
            </Item>}
            {(isAdmin || isManager || isSupport || isCollector || isCollectorAux || isSales || isAccountant || isTreasurer || isAuditor) &&
            <Item key="reportes/boletas">
              <Link to="/reportes/boletas">
                <Icon type="unordered-list"/>
                Boletas
              </Link>
            </Item>}
            {(isAdmin || isManager || isSupport || isCollector || isCollectorAux || isSales || isAccountant || isTreasurer) &&
            <Item key="reportes/clientes">
              <Link to="/reportes/clientes">
                <Icon type="usergroup-add"/>
                Clientes
              </Link>
            </Item>}
            {(isAdmin || isManager || isSupport || isCashier || isCollector || isCollectorAux || isAccountant || isTreasurer) &&
            <Item key="reportes/turnos">
              <Link to="/reportes/turnos">
                <Icon type="file-done"/>
                Turnos
              </Link>
            </Item>}
            {(isAdmin || isManager || isSupport || isSales || isAccountant || isTreasurer) &&
            <Item key="reportes/ventas">
              <Link to="/reportes/ventas">
                <Icon type="dollar"/>
                Ventas
              </Link>
            </Item>}
            {(isAdmin || isManager || isSupport || isSales || isAccountant || isTreasurer) && <Item key="reportes/tiempos">
              <Link to="/reportes/tiempos">
                <Icon type="clock-circle"/>
                Tiempos
              </Link>
            </Item>}
          </SubMenu>
        )}
        {(isAdmin || isManager || isSales) && (
          <SubMenu
            title={
              <span className="submenu-title-wrapper">
                <Icon type="dollar"/>
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
        {(isAdmin || isAccountant || isManager || isCashier || isCollector || isCollectorAux || isTreasurer) && (
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
            <Item key="facturas/registros">
              <Link to="/facturas/registros">
                <Icon type="read"/>
                Registros
              </Link>
            </Item>
          </SubMenu>
        )}
        {(isAdmin || isManager || isSupport || isDriver) && (
          <SubMenu
            title={
              <span className="submenu-title-wrapper">
                <Icon type="experiment"/>
                <span>Producción</span>
              </span>
            }
          >
            {(!isDriver) && <Item key="produccion/voladuras">
              <Link to="/produccion/voladuras">
                <Icon type="rocket"/>
                Voladuras
              </Link>
            </Item>}
            {(!isDriver) && <Item key="produccion/barrenaciones">
              <Link to="/produccion/barrenaciones">
                <Icon type="fire"/>
                Barrenaciones
              </Link>
            </Item>}
            <Item key="produccion/viajes">
              <Link to="/produccion/viajes">
                <Icon type="pull-request"/>
                Viajes
              </Link>
            </Item>
          </SubMenu>
        )}
        {(isAdmin || isAccountant || isSupport || isManager || isCashier || isCollector || isCollectorAux || isTreasurer) && (
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
