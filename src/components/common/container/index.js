import React from 'react';
import PropTypes from 'prop-types';
import { ContentContainer, TitleContainer } from './elements';

const Container = ({
  children,
  title,
  background,
  width,
  height,
  margin,
  padding,
  display,
  direction,
  justify,
  opacity,
  align
}) => {
  return (
    <ContentContainer
      background={background}
      width={width}
      height={height}
      margin={margin}
      padding={padding}
      display={display}
      direction={direction}
      justify={justify}
      opacity={opacity}
      align={align}
    >
      {title && <TitleContainer>{title}</TitleContainer>}
      {children}
    </ContentContainer>
  );
};

Container.propTypes = {
  children: PropTypes.any.isRequired,
  title: PropTypes.string,
  background: PropTypes.string,
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  margin: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  padding: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  display: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  direction: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  justify: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  opacity: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  align: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
};

Container.defaultProps = {
  title: null,
  background: null,
  width: null,
  height: null,
  margin: null,
  padding: null,
  display: null,
  direction: null,
  justify: null,
  opacity: null,
  align: null
};

export default Container;
