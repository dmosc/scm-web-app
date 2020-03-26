import React from 'react';
import { Form } from 'antd';
import { useAuth } from 'components/providers/withAuth';
import Container from 'components/common/container';
import Chat from './components/chat';
import PostForm from './components/post-form';
import ChatContainer from './elements';

const Messages = () => {
  const { user, isAdmin, isManager } = useAuth();
  const PostRegisterForm = Form.create({ name: 'post' })(PostForm);

  return (
    <ChatContainer>
      {(isAdmin || isManager) && (
        <Container title="Crear publicación" width="50%" alignitems="center">
          <PostRegisterForm user={user} />
        </Container>
      )}
      <Container title="Chat" width={isAdmin ? '50%' : '80%'} height="70vh" alignitems="center">
        <Chat user={user} />
      </Container>
    </ChatContainer>
  );
};

export default Messages;
