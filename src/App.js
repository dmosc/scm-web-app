import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Redirect, Route, Switch, withRouter } from 'react-router-dom';
import Loadable from 'react-loadable';
import Layout from 'components/layout/main';
import { useAuth } from 'components/providers/withAuth';
import TopBarProgress from 'react-topbar-progress-indicator';
import Auth from 'views/auth';
import './App.css';

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

/* webpackChunkName: "History" */
const Reports = Loadable({
  loader: () => import('./views/reports'),
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
    token,
    user
  } = useAuth();

  if (isLoader && !collapsed) setCollapsed(true);

  return (
    <Switch>
      {!token && <Route exact path="/auth" render={() => <Auth />} />}
      {!token && <Redirect from={`${pathname}`} to="/auth" />}
      <Layout user={user} collapsed={collapsed} onCollapse={setCollapsed}>
        <Switch>
          <Route exact path="/dashboard" component={Dashboard} />
          {(isAdmin || isCashier || isSupport || isManager) && (
            <Route exact path="/boletas" component={Tickets} />
          )}
          {(isAdmin || isAccountant || isSupport || isManager) && (
            <Route exact path="/registros/clientes" component={Clients} />
          )}
          {(isAdmin || isAccountant || isSupport || isManager) && (
            <Route exact path="/registros/peticiones-clientes" component={ClientPriceRequests} />
          )}
          {(isAdmin || isAccountant || isSupport || isManager) && (
            <Route exact path="/registros/camiones" component={Trucks} />
          )}
          {(isAdmin || isAccountant || isSupport || isManager) && (
            <Route exact path="/registros/productos" component={Products} />
          )}
          {(isAdmin || isAccountant || isSupport || isManager) && (
            <Route exact path="/registros/peticiones-productos" component={ProductPriceRequests} />
          )}
          {(isAdmin || isAccountant || isSupport || isManager) && (
            <Route exact path="/registros/usuarios" component={Users} />
          )}
          {(isAdmin || isAccountant || isSupport || isManager) && (
            <Route exact path="/historial" component={History} />
          )}
          {(isAdmin || isAccountant || isSupport || isManager) && (
            <Route exact path="/reportes" component={Reports} />
          )}
          {(isAdmin || isAccountant || isSupport || isManager || isLoader || isCashier) && (
            <Route exact path="/mensajes" component={Messages} />
          )}
          {(isAdmin || isAccountant || isManager) && (
            <Route exact path="/facturas" component={Bills} />
          )}
          {(isAdmin || isGuard || isSupport || isManager) && (
            <Route exact path="/accesos" component={Access} />
          )}
          {(isAdmin || isLoader || isSupport || isManager) && (
            <Route exact path="/cargas" component={Load} />
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
