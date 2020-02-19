import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Switch, Route, Redirect, withRouter } from 'react-router-dom';
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

const PriceRequests = Loadable({
  loader: () => import('./views/registry/price-requests'),
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

/* webpackChunkName: "Access" */
const Access = Loadable({
  loader: () => import('./views/access'),
  loading: TopBarProgress
});

const App = ({
  history: {
    location: { pathname }
  }
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const { isAdmin, isGuard, isCashier, isAccountant, token, user } = useAuth();

  return (
    <Switch>
      {!token && <Route path="/auth" render={() => <Auth />} />}
      {!token && <Redirect from={`${pathname}`} to="/auth" />}
      <Layout user={user} collapsed={collapsed} onCollapse={setCollapsed}>
        <Switch>
          {(isAdmin || isCashier) && <Route path="/dashboard" component={Dashboard} />}
          {(isAdmin || isCashier) && <Route path="/boletas" component={Tickets} />}
          {(isAdmin || isCashier) && <Route path="/registros/clientes" component={Clients} />}
          {(isAdmin || isAccountant) && (
            <Route path="/registros/clients/solicitudes-de-precio" component={PriceRequests} />
          )}
          {(isAdmin || isCashier) && <Route path="/registros/camiones" component={Trucks} />}
          {isAdmin && <Route path="/registros/productos" component={Products} />}
          {isAdmin && <Route path="/registros/usuarios" component={Users} />}
          {isAdmin && <Route path="/historial" component={History} />}
          {(isAdmin || isCashier || isGuard) && <Route path="/mensajes" component={Messages} />}
          {(isAdmin || isGuard) && <Route path="/accesos" component={Access} />}
          {isGuard && <Redirect to="/accesos" />}
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
