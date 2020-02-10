/* eslint-disable no-unused-expressions */
import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { Icon, PageHeader, Menu } from 'antd';
import { useAuth } from 'components/providers/withAuth';
import cookie from 'react-cookies';
import { MenuItem } from 'components/common/menu/elements';
import { NavbarContainer } from './elements';

const NavBar = ({ history, location }) => {
  const handleLogout = () => {
    cookie.remove('token', { path: '/' });
    window.location.reload();
  };

  const { user } = useAuth();

  const format = pathname => {
    const title = pathname.substring(pathname.lastIndexOf('/') + 1);
    return title.charAt(0).toUpperCase() + title.slice(1);
  };

  return (
    <NavbarContainer>
      <Menu mode="horizontal" style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <PageHeader
          style={{
            marginRight: 'auto',
            padding: '10px 20px'
          }}
          onBack={() => history.goBack()}
          title={format(location.pathname)}
        />
        <MenuItem key="1" disabled={true}>
          <Icon type="user" />
          <span>{user.firstName}</span>
        </MenuItem>
        <MenuItem onClick={() => window.location.reload()} key="2">
          <Icon type="reload" />
          <span>Recargar</span>
        </MenuItem>
        <MenuItem key="3" onClick={handleLogout}>
          <Icon type="logout" />
          <span>Salir</span>
        </MenuItem>
      </Menu>
    </NavbarContainer>
  );
};

NavBar.propTypes = {
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired
};

export default withRouter(NavBar);
