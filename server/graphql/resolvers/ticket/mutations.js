import {Ticket} from '../../../database/models';
import authenticated from '../../middleware/authenticated';
import {ApolloError} from 'apollo-client';

const ticketMutations = {
  ticket: authenticated(async (_, args, {pubsub}) => {
    const ticket = new Ticket({...args.ticket});

    try {
      await ticket.save();
      pubsub.publish('NEW_TICKET', {
        newTicket: ticket,
      });
      return ticket;
    } catch (e) {
      return new ApolloError(e);
    }
  }),
};

export default ticketMutations;
