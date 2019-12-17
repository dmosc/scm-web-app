const ticketSubscriptions = {
  newTicket: {
    subscribe: (_, __, {pubsub}) => pubsub.asyncIterator(['NEW_TICKET']),
  },
};

export default ticketSubscriptions;
