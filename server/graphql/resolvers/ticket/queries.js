import { ApolloError } from 'apollo-server';
import { Ticket } from '../../../mongo-db/models';
import authenticated from '../../middleware/authenticated';

const ticketQueries = {
  ticket: authenticated(async (_, args) => {
    const { id } = args;
    const ticket = await Ticket.findById(id).populate('client truck product turn');

    if (!ticket) throw new Error('¡No ha sido posible encontrar el ticket!');

    return ticket;
  }),
  tickets: authenticated(async (_, { filters: { limit } }) => {
    const tickets = await Ticket.find({})
      .limit(limit || 50)
      .populate('client truck product turn');

    if (!tickets) throw new ApolloError('¡Ha habido un error cargando los tickets!');
    else return tickets;
  })
};

export default ticketQueries;
