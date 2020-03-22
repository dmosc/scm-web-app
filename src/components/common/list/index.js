import React from 'react';
import PropTypes from 'prop-types';
import { ContentList, ListContentContainer, TitleList } from './elements';

const ListContainer = ({ children, title, height }) => {
  return (
    <ListContentContainer>
      {title && <TitleList>{title}</TitleList>}
      <ContentList height={height}>{children}</ContentList>
    </ListContentContainer>
  );
};

ListContainer.defaultProps = {
  title: null,
  height: null
};

ListContainer.propTypes = {
  children: PropTypes.object.isRequired,
  title: PropTypes.string,
  height: PropTypes.string
};

export default ListContainer;
