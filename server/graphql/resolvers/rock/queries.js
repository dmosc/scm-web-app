import {Rock} from '../../../mongo-db/models';
import authenticated from '../../middleware/authenticated';
import {ApolloError} from 'apollo-server';

const ticketQueries = {
  rock: authenticated(async (_, args) => {
    const {id} = args;
    const rock = await Rock.findById(id).populate('client truck product');

    if (!rock) throw new Error('Rock does not exists!');

    return rock;
  }),
  rocks: authenticated(async (_, {filters: {limit}}) => {
    const rocks = await Rock.find({}).limit(limit || 10);

    if (!rocks) throw new ApolloError('No rocks registered!');
    else return rocks;
  }),
};

export default ticketQueries;
