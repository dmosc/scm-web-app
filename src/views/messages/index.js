import React from 'react';
import { Card } from 'antd';
import { useAuth } from 'components/providers/withAuth';
import Chat from './components/chat';
import ChatContainer from './elements';

const Messages = () => {
  const { user } = useAuth();

  return (
    <ChatContainer>
      <Card title="Chat" style={{ width: '100%' }}>
        <Chat user={user} />
      </Card>
    </ChatContainer>
  );
};

export default Messages;
