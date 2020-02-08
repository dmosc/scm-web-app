import React from 'react';
import { withRouter, Link } from 'react-router-dom';
import { Icon } from 'antd';
import { MenuContainer, MenuItem } from './elements';

const Menu = ({ items, mode, history }) => {
  return (
    <MenuContainer
      theme="light"
      defaultSelectedKeys={history.location.pathname
        .toLowerCase()
        .replace(/\s/g, '-')
        .substring(history.location.pathname.lastIndexOf('/') + 1)}
      mode={mode}
    >
      {items.map(({ icon, title }) => (
        <MenuItem key={title.toLowerCase().replace(/\s/g, '-')}>
          <Link to={`${title.toLowerCase().replace(/\s/g, '-')}`}>
            <Icon type={icon} />
            <span>{title}</span>
          </Link>
        </MenuItem>
      ))}
    </MenuContainer>
  );
};

export default withRouter(Menu);
