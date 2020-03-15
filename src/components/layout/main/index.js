import React from 'react';
import PropTypes from 'prop-types';
import { Layout as Layer } from 'antd';
import { Sidebar, Navbar, Footer } from './components';

const Layout = ({ children, collapsed, onCollapse }) => (
  <Layer style={{ minHeight: '100vh', maxHeight: '100vh' }}>
    <Sidebar collapsed={collapsed} onCollapse={onCollapse} />
    <Layer>
      <Navbar />
      {children}
      <Footer />
    </Layer>
  </Layer>
);

Layout.propTypes = {
  children: PropTypes.any.isRequired,
  collapsed: PropTypes.bool.isRequired,
  onCollapse: PropTypes.func.isRequired
};

export default Layout;
