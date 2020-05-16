import React from 'react';
import { withAuth } from 'components/providers/withAuth';
import { Route, Switch } from 'react-router-dom';
import TopBarProgress from 'react-topbar-progress-indicator';
import Loadable from 'react-loadable';
import { SalesContainer } from './elements';

/* webpackChunkName: "Quotations" */
const Quotations = Loadable({
  loader: () => import('./components/quotations'),
  loading: TopBarProgress
});

/* webpackChunkName: "ClientSubscriptions" */
const ClientSubscriptions = Loadable({
  loader: () => import('./components/client-subscriptions'),
  loading: TopBarProgress
});

const Reports = () => {
  return (
    <SalesContainer>
      <Switch>
        <Route path="/ventas/cotizaciones" render={() => <Quotations />} />
        <Route path="/ventas/seguimiento" render={() => <ClientSubscriptions />} />
      </Switch>
    </SalesContainer>
  );
};

export default withAuth(Reports);
