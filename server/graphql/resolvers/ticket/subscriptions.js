const ticketSubscriptions = {
  newTicket: {
    subscribe: (_, __, {pubsub}) => pubsub.asyncIterator(['NEW_TICKET']),
  },
  ticketUpdate: {
    subscribe: (_, __, {pubsub}) => pubsub.asyncIterator(['TICKET_UPDATE']),
  },
};

export default ticketSubscriptions;
