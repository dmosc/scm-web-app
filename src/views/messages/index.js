import React from 'react';
import PropTypes from 'prop-types';
import { Form } from 'antd';
import { withAuth } from 'components/providers/withAuth';
import Container from 'components/common/container';
import Chat from './components/chat';
import PostForm from './components/post-form';
import ChatContainer from './elements';

const Messages = ({ auth: { user, isAdmin } }) => {
  const PostRegisterForm = Form.create({ name: 'post' })(PostForm);

  return (
    <ChatContainer>
      {isAdmin && (
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

Messages.propTypes = {
  auth: PropTypes.object.isRequired
};

export default withAuth(Messages);
