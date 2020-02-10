import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Switch, Route, Redirect, withRouter } from 'react-router-dom';
import Loadable from 'react-loadable';
import Layout from 'components/layout/main';
import { useAuth } from 'components/providers/withAuth';
import TopBarProgress from 'react-topbar-progress-indicator';
import { Auth } from 'views';
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

/* webpackChunkName: "Registry" */
const Registry = Loadable({
  loader: () => import('./views/registry'),
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
  const { isAdmin, isGuard, isCashier, token, user } = useAuth();

  return (
    <Switch>
      {!token && <Route path="/auth" render={() => <Auth />} />}
      {!token && <Redirect from={`${pathname}`} to="/auth" />}
      <Layout user={user} collapsed={collapsed} onCollapse={setCollapsed}>
        <Switch>
          {(isAdmin || isCashier) && (
            <Route
              path="/dashboard"
              render={() => <Dashboard collapsed={collapsed} onCollapse={setCollapsed} />}
            />
          )}
          {(isAdmin || isCashier) && (
            <Route
              path="/boletas"
              render={() => <Tickets collapsed={collapsed} onCollapse={setCollapsed} />}
            />
          )}
          {(isAdmin || isCashier) && (
            <Route
              path="/registros"
              render={() => <Registry collapsed={collapsed} onCollapse={setCollapsed} />}
            />
          )}
          {isAdmin && (
            <Route
              path="/historial"
              render={() => <History collapsed={collapsed} onCollapse={setCollapsed} />}
            />
          )}
          {(isAdmin || isCashier || isGuard) && (
            <Route
              path="/mensajes"
              render={() => <Messages collapsed={collapsed} onCollapse={setCollapsed} />}
            />
          )}
          {(isAdmin || isGuard) && (
            <Route
              path="/accesos"
              render={() => <Access collapsed={collapsed} onCollapse={setCollapsed} />}
            />
          )}
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
