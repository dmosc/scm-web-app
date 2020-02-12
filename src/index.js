import React from 'react';
import ReactDOM from 'react-dom';
import { AuthProvider } from 'components/providers/withAuth';
import { BrowserRouter as Router } from 'react-router-dom';
import { preloadReady } from 'react-loadable';
import client from 'apollo';
import { ApolloProvider } from 'react-apollo';
import App from './App';

window.onload = async () => {
  await preloadReady();

  ReactDOM.render(
    <ApolloProvider client={client}>
      <AuthProvider>
        <Router basename="/">
          <App />
        </Router>
      </AuthProvider>
    </ApolloProvider>,
    document.getElementById('root')
  );
};
