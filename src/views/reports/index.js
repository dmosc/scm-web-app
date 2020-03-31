import React, { useState } from 'react';
import { withAuth } from 'components/providers/withAuth';
import { useDebounce } from 'use-lodash-debounce';
import { Switch, Route, Redirect } from 'react-router-dom';
import { ReportsContainer } from './elements';
import TitleSection from './components/title-section';
import Global from './components/global';
import Products from './components/products';
import Tickets from './components/tickets';
import Clients from './components/clients';
import Trucks from './components/trucks';
import Turns from './components/turns';

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
