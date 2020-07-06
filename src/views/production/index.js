import React from 'react';
import { useAuth } from 'components/providers/withAuth';
import { Redirect, Route, Switch, withRouter } from 'react-router-dom';
import TopBarProgress from 'react-topbar-progress-indicator';
import Loadable from 'react-loadable';

/* webpackChunkName: "Blasts" */
const Blasts = Loadable({
  loader: () => import('./components/blasts'),
  loading: TopBarProgress
});

/* webpackChunkName: "Trips" */
const Trips = Loadable({
  loader: () => import('./components/trips'),
  loading: TopBarProgress
});

const Production = () => {
  const { isDriver } = useAuth();
  return (
    <Switch>
      <Route
        path="/produccion/voladuras"
        render={() => <Blasts/>}
      />
      <Route
        path="/produccion/viajes"
        render={() => <Trips/>}
      />
      {isDriver && <Redirect to="/produccion/viajes"/>}
      <Redirect to="/produccion/voladuras"/>
    </Switch>
  );
};

export default withRouter(Production);