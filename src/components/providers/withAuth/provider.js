import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { withApollo } from 'react-apollo';
import jwt from 'jsonwebtoken';
import cookie from 'react-cookies';
import { GET_USER_DATA } from './graphql/queries';

export const AuthContext = React.createContext({});

const AuthProvider = ({ children, client }) => {
  const [user, setUser] = useState({});
  const token = cookie.load('token');
  const tokenPayload = token ? jwt.decode(token) : {};

  useEffect(() => {
    const getUserData = async () => {
      if (token) {
        const {
          data: { user: userToSet }
        } = await client.query({
          query: GET_USER_DATA,
          variables: { id: tokenPayload.id }
        });

        setUser(userToSet);
      }
    };

    getUserData();
  }, [client, token, tokenPayload.id]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAdmin: tokenPayload.role === 'ADMIN',
        isGuard: tokenPayload.role === 'GUARD',
        isLoader: tokenPayload.role === 'LOADER',
        isCashier: tokenPayload.role === 'CASHIER',
        isAccountant: tokenPayload.role === 'ACCOUNTANT'
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.any.isRequired,
  client: PropTypes.object.isRequired
};

export default withApollo(AuthProvider);
