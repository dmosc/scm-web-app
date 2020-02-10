import styled from 'styled-components';
import ScrollableFeed from 'react-scrollable-feed';
import { Typography } from 'antd';

const { Text } = Typography;

const ChatContainer = styled.div`
  height: 55vh;
  min-height: 55vh;
  max-height: 55vh;
  margin: 5px;
  padding: 10px;
  position: relative;
  overflow-y: scroll;
  -ms-overflow-style: none;
  scrollbar-width: none;
  ::-webkit-scrollbar {
    display: none;
  }
`;

const MessageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: ${props => (props.username ? 'flex-end' : 'flex-start')};
  margin: 5;
  padding: 5;
  margin-top: auto;
`;

const MessageSender = styled(Text)`
  color: ${props => (props.username ? '#7cb305' : '#a0d911')};
`;

const Message = styled.div`
  display: flex;
  flex-direction: column;
  align-items: ${props => (props.username ? 'flex-end' : 'flex-start')};
  text-align: ${props => (props.username ? 'right' : 'left')};
  width: 40%;
`;

const ScrollableContext = styled(ScrollableFeed)`
  -ms-overflow-style: none;
  scrollbar-width: none;
  ::-webkit-scrollbar {
    display: none;
  }
`;

export { ChatContainer, MessageContainer, MessageSender, Message, ScrollableContext };
