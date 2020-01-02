const messageSubscriptions = {
  newMessage: {
    subscribe: (_, __, {pubsub}) => pubsub.asyncIterator(['NEW_MESSAGE']),
  },
};

export default messageSubscriptions;
