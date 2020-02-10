import React, { useContext } from 'react';
import AuthProvider, { AuthContext } from './provider';

const useAuth = () => useContext(AuthContext);

const withAuth = Component => props => (
  <AuthContext.Consumer>{state => <Component {...props} auth={state} />}</AuthContext.Consumer>
);

export { useAuth, withAuth, AuthProvider };
