const postSubscriptions = {
  newPost: {
    subscribe: (_, __, {pubsub}) => pubsub.asyncIterator(['NEW_POST']),
  },
};

export default postSubscriptions;
