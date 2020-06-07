import React, { Component } from 'react';
import { graphql } from '@apollo/react-hoc';
import { Typography } from 'antd';
import MessageForm from './components/message-form';
import {
  ChatContainer,
  MessageContainer,
  Message,
  MessageSender,
  ScrollableContext
} from './elements';
import { GET_MESSAGES } from './graphql/queries';
import { NEW_MESSAGES } from './graphql/subscriptions';

const { Paragraph } = Typography;

class Chat extends Component {
  componentDidMount = () => {
    const {
      data: { subscribeToMore }
    } = this.props;

    if (!this.unsubscribeToMessages)
      this.unsubscribeToMessages = this.subscribeToMessages(subscribeToMore);
  };

  componentWillUnmount = () => {
    this.unsubscribeToMessages();
  };

  subscribeToMessages = subscribeToMore => {
    return subscribeToMore({
      document: NEW_MESSAGES,
      updateQuery: (prev, { subscriptionData: { data } }) => {
        const { messages: oldMessages } = prev;
        const { newMessage } = data;
        if (!newMessage) return prev;

        for (let i = 0; i < oldMessages.length; i++)
          if (newMessage.id === oldMessages[i].id) return prev;

        const messages = [...oldMessages, newMessage];

        return { messages };
      }
    });
  };

  render() {
    const { user, data } = this.props;

    const { loading, error, messages } = data;

    if (loading) return <div>Cargando mensajes recientes...</div>;
    if (error) return <div>¡No se han podido cargar los mensajes!</div>;

    return (
      <div style={{ width: '100%' }}>
        <ChatContainer>
          <ScrollableContext>
            {messages.map(message => (
              <MessageContainer
                key={message.id}
                username={message.username === user.username ? message.username : undefined}
              >
                <Message
                  username={message.username === user.username ? message.username : undefined}
                >
                  <MessageSender
                    username={message.username === user.username ? message.username : undefined}
                    strong
                  >
                    {message.username}
                  </MessageSender>
                  <Paragraph copyable ellipsis={{ rows: 5, expandable: true }}>
                    {message.content}
                  </Paragraph>
                </Message>
              </MessageContainer>
            ))}
          </ScrollableContext>
        </ChatContainer>
        <MessageForm user={user} />
      </div>
    );
  }
}

export default graphql(GET_MESSAGES, { options: () => ({ variables: { filters: {} } }) })(Chat);
