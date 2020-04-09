import React from 'react';
import Loadable from 'react-loadable';
import TopBarProgress from 'react-topbar-progress-indicator';
import { Redirect, Route, Switch } from 'react-router-dom';

/* webpackChunkName: "Grouper" */
const Grouper = Loadable({
  loader: () => import('./components/grouper'),
  loading: TopBarProgress
});

/* webpackChunkName: "History" */
const History = Loadable({
  loader: () => import('./components/history'),
  loading: TopBarProgress
});

const Bills = () => {
  return (
    <Switch>
      <Route path="/facturas/agrupador" render={() => <Grouper />} />
      <Route path="/facturas/registros" render={() => <History />} />
      <Redirect to="/facturas" />
    </Switch>
  );
};

export default Bills;
