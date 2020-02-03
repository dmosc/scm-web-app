const turnSubscriptions = {
    turnUpdate: {
        subscribe: (_, __, {pubsub}) => pubsub.asyncIterator('TURN_UPDATE'),
    },
};

export default turnSubscriptions;
