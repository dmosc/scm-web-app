import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { withAuth } from 'components/providers/withAuth';
import { useDebounce } from 'use-lodash-debounce';
import { Switch, Route, Redirect, withRouter } from 'react-router-dom';
import TopBarProgress from 'react-topbar-progress-indicator';
import Loadable from 'react-loadable';
import moment from 'moment';
import { ReportsContainer } from './elements';
import TitleSection from './components/title-section';
import Sales from './components/sales';

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

/* webpackChunkName: "Turns" */
const Turns = Loadable({
  loader: () => import('./components/turns'),
  loading: TopBarProgress
});

/* webpackChunkName: "Times" */
const Times = Loadable({
  loader: () => import('./components/times'),
  loading: TopBarProgress
});

const Reports = ({ location }) => {
  const [globalFilters, setGlobalFilters] = useState({
    start: moment().subtract(1, 'month'),
    end: moment()
  });
  const debouncedGlobalFilters = useDebounce(globalFilters, 1000);

  return (
    <ReportsContainer>
      <TitleSection
        hideDateFilter={location.pathname.includes('ventas')}
        setGlobalFilters={setGlobalFilters}
        globalFilters={globalFilters}
      />
      <Switch>
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
          path="/reportes/turnos"
          render={() => <Turns globalFilters={debouncedGlobalFilters} />}
        />
        <Route path="/reportes/ventas" render={() => <Sales />} />
        <Route
          path="/reportes/tiempos"
          render={() => <Times globalFilters={debouncedGlobalFilters} />}
        />
        <Redirect to="/reportes/global" />
      </Switch>
    </ReportsContainer>
  );
};

Reports.propTypes = {
  location: PropTypes.object.isRequired
};

export default withRouter(withAuth(Reports));
