import styled from 'styled-components';
import { Layout as Layer } from 'antd';

const { Content } = Layer;

const ContentContainer = styled(Content)`
  margin: ${props => props.margin ?? '30px'};
  padding: ${props => props.padding ?? '30px'};
  border-radius: 5px;
  box-shadow: 0 0 2rem 0 rgba(136, 152, 170, 0.15);
  background-color: ${props =>
    props.opacity ? `rgba(255, 255, 255, ${props.opacity})` : 'rgba(255, 255, 255, 1)'};
  overflow-y: scroll;
  -ms-overflow-style: none;
  scrollbar-width: none;
  ::-webkit-scrollbar {
    display: none;
  }
  display: ${props => (props.display ? props.display : null)};
  flex-direction: ${props => (props.direction ? props.direction : null)};
  justify-content: ${props => (props.justify ? props.justify : null)};
  align-items: ${props => (props.align ? props.align : null)};
  flex-wrap: wrap;
  width: ${props => (props.width ? props.width : 'fit-content')};
  max-width: ${props => (props.width ? props.width : null)};
  height: ${props => (props.height ? props.height : 'fit-content')};
  max-height: ${props => (props.height ? props.height : null)};

  &:hover {
    box-shadow: 0 0 3rem 0 rgba(136, 152, 170, 0.2);
  }
`;

const TitleContainer = styled.h1`
  text-transform: uppercase;
  font-weight: bold;
`;

export { ContentContainer, TitleContainer };
