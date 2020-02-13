import { ApolloError } from 'apollo-server';
import { Op } from 'sequelize';
import { Ticket } from '../../../mongo-db/models';
import { Ticket as ArchiveTicket } from '../../../sequelize-db/models';
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
  }),
  activeTickets: authenticated(async (_, { filters: { limit } }) => {
    const activeTickets = await Ticket.find({ turn: { $exists: false } })
      .limit(limit || 50)
      .populate('client truck product');

    if (!activeTickets) throw new ApolloError('¡Ha habido un error cargando los tickets!');
    else return activeTickets;
  }),
  archivedTickets: authenticated(
    async (_, { filters: { limit, offset, search: oldSearch, start, end, date } }) => {
      const search = `%${oldSearch}%`;

      const archivedTickets = await ArchiveTicket.findAll({
        limit: limit || 100,
        offset: offset || 0,
        where: {
          createdAt: {
            [Op.between]: [start || '1970-01-01T00:00:00.000Z', end || '2100-12-31T00:00:00.000Z']
          },
          [Op.or]: [
            { createdAt: date },
            { folio: { [Op.like]: search || '%' } },
            { driver: { [Op.like]: search || '%' } },
            { client: { [Op.like]: search || '%' } },
            { businessName: { [Op.like]: search || '%' } },
            { address: { [Op.like]: search || '%' } },
            { rfc: { [Op.like]: search || '%' } },
            { plates: { [Op.like]: search || '%' } },
            { product: { [Op.like]: search || '%' } }
          ]
        }
      });

      if (!archivedTickets) throw new ApolloError('¡Ha habido un error cargando los tickets!');
      else return archivedTickets;
    }
  )
};

export default ticketQueries;
