import React from 'react';
import ReactDOM from 'react-dom';
import { AuthProvider } from 'components/providers/withAuth';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { theme } from 'theme';
import { preloadReady } from 'react-loadable';
import client from 'apollo';
import { ApolloProvider } from 'react-apollo';
import App from './App';

window.onload = async () => {
  await preloadReady();

  ReactDOM.render(
    <ApolloProvider client={client}>
      <AuthProvider>
        <ThemeProvider theme={theme}>
          <Router basename="/">
            <App />
          </Router>
        </ThemeProvider>
      </AuthProvider>
    </ApolloProvider>,
    document.getElementById('root')
  );
};
