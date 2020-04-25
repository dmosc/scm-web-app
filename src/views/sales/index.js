import React from 'react';
import { withAuth } from 'components/providers/withAuth';
import { Switch, Route, Redirect } from 'react-router-dom';
import TopBarProgress from 'react-topbar-progress-indicator';
import Loadable from 'react-loadable';
import { SalesContainer } from './elements';

/* webpackChunkName: "Quotations" */
const Quotations = Loadable({
  loader: () => import('./components/quotations'),
  loading: TopBarProgress
});

const Reports = () => {
  return (
    <SalesContainer>
      <Switch>
        <Route path="/ventas/cotizaciones" render={() => <Quotations />} />
        <Redirect to="/ventas/cotizaciones" />
      </Switch>
    </SalesContainer>
  );
};

export default withAuth(Reports);
