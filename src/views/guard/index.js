import React, {Component} from 'react';
import {Switch, Route, Redirect} from 'react-router-dom';
import jwt from 'jsonwebtoken';
import cookie from 'react-cookies';
import Loadable from 'react-loadable';
import TopBarProgress from 'react-topbar-progress-indicator';
import {withApollo} from 'react-apollo';
import {JWT_SECRET} from 'config';
import {GET_USER_DATA} from './graphql/queries';

/* webpackChunkName: "DashboardRegistry" */
const DashboardRegistry = Loadable({
  loader: () => import('./components/dashboard-registry'),
  loading: TopBarProgress,
});

/* webpackChunkName: "DashboardMessages" */
const DashboardMessages = Loadable({
  loader: () => import('./components/dashboard-messages'),
  loading: TopBarProgress,
});

class Guard extends Component {
  state = {
    user: {},
    collapsed: false,
  };

  onCollapse = collapsed => {
    this.setState({collapsed});
  };

  componentDidMount = async () => {
    const {client} = this.props;

    try {
      const token = cookie.load('token');
      const {id} = jwt.verify(token, JWT_SECRET);

      const {
        data: {user},
      } = await client.query({
        query: GET_USER_DATA,
        variables: {id},
      });

      this.setState({user});
    } catch (e) {
      window.location.reload();
    }
  };

  render() {
    const {user, collapsed} = this.state;

    return (
      <Switch>
        <Route
          path="/guard/registros"
          render={() => (
            <DashboardRegistry
              collapsed={collapsed}
              onCollapse={this.onCollapse}
              user={user}
            />
          )}
        />
        <Route
          path="/guard/mensajes"
          render={() => (
            <DashboardMessages
              collapsed={collapsed}
              onCollapse={this.onCollapse}
              user={user}
            />
          )}
        />
        <Redirect from="/guard" to="/guard/registros" />
      </Switch>
    );
  }
}

export default withApollo(Guard);
