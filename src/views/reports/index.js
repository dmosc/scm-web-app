import React, { useState } from 'react';
import { withAuth } from 'components/providers/withAuth';
import { useDebounce } from 'use-lodash-debounce';
import { Switch, Route, Redirect } from 'react-router-dom';
import TopBarProgress from 'react-topbar-progress-indicator';
import Loadable from 'react-loadable';
import { ReportsContainer } from './elements';
import TitleSection from './components/title-section';

/* webpackChunkName: "Global" */
const Global = Loadable({
  loader: () => import('./components/global'),
  loading: TopBarProgress
});

/* webpackChunkName: "Products" */
const Products = Loadable({
  loader: () => import('./components/products'),
  loading: TopBarProgress
});

/* webpackChunkName: "Tickets" */
const Tickets = Loadable({
  loader: () => import('./components/tickets'),
  loading: TopBarProgress
});

/* webpackChunkName: "Clients" */
const Clients = Loadable({
  loader: () => import('./components/clients'),
  loading: TopBarProgress
});

/* webpackChunkName: "Trucks" */
const Trucks = Loadable({
  loader: () => import('./components/trucks'),
  loading: TopBarProgress
});

/* webpackChunkName: "Turns" */
const Turns = Loadable({
  loader: () => import('./components/turns'),
  loading: TopBarProgress
});

const Reports = () => {
  const [globalFilters, setGlobalFilters] = useState({
    start: null,
    end: null
  });
  const debouncedGlobalFilters = useDebounce(globalFilters, 1000);

  return (
    <ReportsContainer>
      <TitleSection setGlobalFilters={setGlobalFilters} globalFilters={globalFilters} />
      <Switch>
        <Route
          path="/reportes/global"
          render={() => <Global globalFilters={debouncedGlobalFilters} />}
        />
        <Route
          path="/reportes/productos"
          render={() => <Products globalFilters={debouncedGlobalFilters} />}
        />
        <Route
          path="/reportes/boletas"
          render={() => <Tickets globalFilters={debouncedGlobalFilters} />}
        />
        <Route
          path="/reportes/clientes"
          render={() => <Clients globalFilters={debouncedGlobalFilters} />}
        />
        <Route
          path="/reportes/camiones"
          render={() => <Trucks globalFilters={debouncedGlobalFilters} />}
        />
        <Route
          path="/reportes/turnos"
          render={() => <Turns globalFilters={debouncedGlobalFilters} />}
        />
        <Redirect to="/reportes/global" />
      </Switch>
    </ReportsContainer>
  );
};

export default withAuth(Reports);
