const ticketSubscriptions = {
  newTicket: {
    subscribe: (_, __, { pubsub }) => pubsub.asyncIterator('NEW_TICKET')
  },
  ticketUpdate: {
    subscribe: (_, __, { pubsub }) => pubsub.asyncIterator('TICKET_UPDATE')
  },
  activeTickets: {
    subscribe: (_, __, { pubsub }) => pubsub.asyncIterator('ACTIVE_TICKETS')
  },
  notLoadedActiveTickets: {
    subscribe: (_, __, { pubsub }) => pubsub.asyncIterator('NOT_LOADED_ACTIVE_TICKETS')
  },
  loadedTickets: {
    subscribe: (_, __, { pubsub }) => pubsub.asyncIterator('LOADED_TICKETS')
  }
};

export default ticketSubscriptions;
