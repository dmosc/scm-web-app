import styled from 'styled-components';

const TitleContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 10px;
  overflow-x: scroll;

  ${props => props.theme.media.lg`
    flex-direction: column;
    align-items: flex-start;
  `}
`;

const ActionsContainer = styled.div`
  display: flex;

  ${props => props.theme.media.lg`
    margin-top: 20px;
  `}
`;

export { TitleContainer, ActionsContainer };
