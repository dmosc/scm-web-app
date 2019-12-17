import {Ticket} from '../../../database/models';
import authenticated from '../../middleware/authenticated';
import {ApolloError} from 'apollo-server';

const ticketQueries = {
  ticket: authenticated(async (_, args) => {
    const {id} = args;
    const ticket = await Ticket.findById(id).populate('client truck product');

    if (!ticket) throw new Error('Ticket does not exists!');

    return ticket;
  }),
  tickets: authenticated(async (_, {filters: {limit}}) => {
    const tickets = await Ticket.find({})
      .limit(limit || 50)
      .populate('client truck product');

    if (!tickets) throw new ApolloError('No tickets registered!');
    else return tickets;
  }),
};

export default ticketQueries;
