const ticketSubscriptions = {
  newTicket: {
    subscribe: (_, __, {pubsub}) => pubsub.asyncIterator(['NEW_TICKET']),
  },
  ticketUpdate: {
    subscribe: (_, __, {pubsub}) => pubsub.asyncIterator(['TICKET_UPDATE']),
  },
  activeTickets: {
    subscribe: (_, __, {pubsub}) => pubsub.asyncIterator(['ACTIVE_TICKETS'])
  }
};

export default ticketSubscriptions;
