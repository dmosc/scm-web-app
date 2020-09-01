import styled from 'styled-components';
import { Card } from 'antd';

const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 30px;
`;

const GeneralContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr;
  grid-gap: 30px;
  padding: 20px;

  ${props => props.theme.media.xl`
    grid-template-columns: 1fr 1fr;
  `}

  ${props => props.theme.media.lg`
    grid-template-columns: 1fr;
  `}
`;

const GraphsContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 30px;

  ${props => props.theme.media.xl`
    grid-template-columns: 1fr;
  `}
`;

const PostsCard = styled(Card)`
  .ant-card-body {
    ${props => props.theme.media.lg`
    max-height: 500px;
    overflow-y: scroll;
  `}
  }
`;

export { InputContainer, GeneralContainer, GraphsContainer, PostsCard };
