import React from 'react';
import { TitleList, ContentList } from './elements';

const ListContainer = ({ children, title, height }) => {
  return (
    <React.Fragment>
      {title && <TitleList>{title}</TitleList>}
      <ContentList height={height}>{children}</ContentList>
    </React.Fragment>
  );
};

export default ListContainer;
