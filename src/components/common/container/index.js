import React from 'react';
import { ContentContainer, TitleContainer } from './elements';

const Container = ({
  children,
  title,
  background,
  width,
  height,
  display,
  direction,
  justify,
  align
}) => {
  return (
    <ContentContainer
      background={background}
      width={width}
      height={height}
      display={display}
      direction={direction}
      justify={justify}
      align={align}
    >
      {title && <TitleContainer>{title}</TitleContainer>}
      {children}
    </ContentContainer>
  );
};

export default Container;
