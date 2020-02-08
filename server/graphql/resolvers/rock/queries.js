import { ApolloError } from 'apollo-server';
import { Rock } from '../../../mongo-db/models';
import authenticated from '../../middleware/authenticated';

const ticketQueries = {
  rock: authenticated(async (_, args) => {
    const { id } = args;
    const rock = await Rock.findById(id).populate('client truck product');

    if (!rock) throw new Error('¡No existe este producto!');

    return rock;
  }),
  rocks: authenticated(async (_, { filters: { limit } }) => {
    const rocks = await Rock.find({}).limit(limit || 10);

    if (!rocks) throw new ApolloError('¡No ha sido posible cargar los productos!');
    else return rocks;
  })
};

export default ticketQueries;
