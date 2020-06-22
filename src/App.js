import React, { useState } from 'react';
import { LOG_ROCKET_ID } from 'config';
import PropTypes from 'prop-types';
import LogRocket from 'logrocket';
import { Redirect, Route, Switch, withRouter } from 'react-router-dom';
import Loadable from 'react-loadable';
import Layout from 'components/layout/main';
import { useAuth } from 'components/providers/withAuth';
import TopBarProgress from 'react-topbar-progress-indicator';
import Auth from 'views/auth';
import moment from 'moment-timezone';
import 'moment/locale/es';
import './App.css';
// Routes with subroutes
import Reports from './views/reports';

// Set every
moment.tz.setDefault('America/Monterrey');

LogRocket.init(LOG_ROCKET_ID);

/* webpackChunkName: "Dashboard" */
const Dashboard = Loadable({
  loader: () => import('./views/dashboard'),
  loading: TopBarProgress
});

/* webpackChunkName: "Access" */
const Access = Loadable({
  loader: () => import('./views/access'),
  loading: TopBarProgress
});

/* webpackChunkName: "Load" */
const Load = Loadable({
  loader: () => import('./views/load'),
  loading: TopBarProgress
});

/* webpackChunkName: "Tickets" */
const Tickets = Loadable({
  loader: () => import('./views/tickets'),
  loading: TopBarProgress
});

/* webpackChunkName: "Clients" */
const Clients = Loadable({
  loader: () => import('./views/registry/clients'),
  loading: TopBarProgress
});

/* webpackChunkName: "ClientPriceRequests" */
const ClientPriceRequests = Loadable({
  loader: () => import('./views/registry/clients-price-requests'),
  loading: TopBarProgress
});

/* webpackChunkName: "ClientsGroup" */
const ClientsGroup = Loadable({
  loader: () => import('./views/registry/clients-group'),
  loading: TopBarProgress
});

/* webpackChunkName: "Trucks" */
const Trucks = Loadable({
  loader: () => import('./views/registry/trucks'),
  loading: TopBarProgress
});

/* webpackChunkName: "Users" */
const Users = Loadable({
  loader: () => import('./views/registry/users'),
  loading: TopBarProgress
});

/* webpackChunkName: "Products" */
const Products = Loadable({
  loader: () => import('./views/registry/products'),
  loading: TopBarProgress
});

/* webpackChunkName: "ProductPriceRequests" */
const ProductPriceRequests = Loadable({
  loader: () => import('./views/registry/products-price-requests'),
  loading: TopBarProgress
});

/* webpackChunkName: "Promotions" */
const Promotions = Loadable({
  loader: () => import('./views/registry/promotions'),
  loading: TopBarProgress
});

/* webpackChunkName: "Machines" */
const Machines = Loadable({
  loader: () => import('./views/registry/machines'),
  loading: TopBarProgress
});

/* webpackChunkName: "DieselRegistry" */
const DieselRegistry = Loadable({
  loader: () => import('./views/registry/diesel-registry'),
  loading: TopBarProgress
});

/* webpackChunkName: "History" */
const Sales = Loadable({
  loader: () => import('./views/sales'),
  loading: TopBarProgress
});

/* webpackChunkName: "Production" */
const Production = Loadable({
  loader: () => import('./views/production'),
  loading: TopBarProgress
});

/* webpackChunkName: "History" */
const History = Loadable({
  loader: () => import('./views/history'),
  loading: TopBarProgress
});

/* webpackChunkName: "Messages" */
const Messages = Loadable({
  loader: () => import('./views/messages'),
  loading: TopBarProgress
});

/* webpackChunkName: "Bills" */
const Bills = Loadable({
  loader: () => import('./views/bills'),
  loading: TopBarProgress
});

const App = ({
  history: {
    location: { pathname }
  }
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const {
    isAdmin,
    isGuard,
    isLoader,
    isCashier,
    isAccountant,
    isManager,
    isSupport,
    isCollector,
    isCollectorAux,
    isSales,
    isTreasurer,
    isAuditor,
    token,
    user
  } = useAuth();

  if (isLoader && !collapsed) setCollapsed(true);

  LogRocket.identify(user.id, {
    username: user.username,
    email: user.email
  });

  return (
    <Switch>
      {!token && <Route exact path="/auth" render={() => <Auth />} />}
      {!token && <Redirect from={`${pathname}`} to="/auth" />}
      <Layout user={user} collapsed={collapsed} onCollapse={setCollapsed}>
        <Switch>
          {!isAuditor && <Route exact path="/dashboard" component={Dashboard}/>}
          {(isAdmin || isCashier || isSupport || isManager || isCollector || isCollectorAux) && (
            <Route exact path="/boletas" component={Tickets}/>
          )}
          {(isAdmin || isSupport || isManager || isCollector || isCollectorAux) && (
            <Route exact path="/registros/clientes" component={Clients}/>
          )}
          {(isAdmin || isSupport || isManager || isCollector || isCollectorAux) && (
            <Route exact path="/registros/peticiones-clientes" component={ClientPriceRequests}/>
          )}
          {(isAdmin || isSupport || isManager) && (
            <Route exact path="/registros/grupos" component={ClientsGroup}/>
          )}
          {(isAdmin || isSupport || isManager || isCollector || isCollectorAux) && (
            <Route exact path="/registros/camiones" component={Trucks}/>
          )}
          {(isAdmin || isSupport || isManager || isCollector || isCollectorAux || isSales) && (
            <Route exact path="/registros/productos" component={Products}/>
          )}
          {(isAdmin || isSupport || isManager || isCollector || isCollectorAux || isSales) && (
            <Route exact path="/registros/peticiones-productos" component={ProductPriceRequests}/>
          )}
          {(isAdmin || isSupport || isManager || isCollector || isSales) && (
            <Route exact path="/registros/promociones" component={Promotions}/>
          )}
          {(isAdmin || isSupport || isManager) && (
            <Route exact path="/registros/maquinas" component={Machines}/>
          )}
          {(isAdmin || isSupport || isManager) && (
            <Route exact path="/registros/diesel" component={DieselRegistry}/>
          )}
          {(isAdmin || isAccountant || isSupport || isManager) && (
            <Route exact path="/registros/usuarios" component={Users}/>
          )}
          {(isAdmin || isManager || isSales) &&
          <Route path="/ventas" component={Sales}/>}
          {(!isGuard) && (
            <Route path="/reportes" component={Reports}/>
          )}
          {(isAdmin || isSupport || isManager) && (
            <Route exact path="/produccion" component={Production}/>
          )}
          {(isAdmin || isAccountant || isSupport || isManager || isCashier || isCollector || isCollectorAux || isTreasurer) && (
            <Route exact path="/historial" component={History}/>
          )}
          {(isAdmin || isAccountant || isManager || isCashier || isCollector || isCollectorAux || isTreasurer) && (
            <Route path="/facturas" component={Bills}/>
          )}
          {(isAdmin || isAccountant || isSupport || isManager || isLoader || isCashier) && (
            <Route exact path="/mensajes" component={Messages}/>
          )}
          {(isAdmin || isGuard || isSupport || isManager || isCashier || isCollector || isCollectorAux) && (
            <Route exact path="/accesos" component={Access}/>
          )}
          {(isAdmin || isLoader || isSupport || isManager) && (
            <Route exact path="/cargas" component={Load}/>
          )}
          {isGuard && <Redirect to="/accesos" />}
          {isLoader && <Redirect to="/cargas" />}
          {!isGuard && <Redirect to="/dashboard" />}
        </Switch>
      </Layout>
    </Switch>
  );
};

App.propTypes = {
  history: PropTypes.object.isRequired
};

export default withRouter(App);
