import React from 'react';
import { TitleList, ContentList } from './elements';

const ListContainer = ({ children, title, height }) => {
  return (
    <>
      {title && <TitleList>{title}</TitleList>}
      <ContentList height={height}>{children}</ContentList>
    </>
  );
};

export default ListContainer;
