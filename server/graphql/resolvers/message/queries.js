import {Message} from '../../../sequelize-db/models';
import authenticated from '../../middleware/authenticated';

const messageQueries = {
  message: authenticated(async (_, args) => {
    const {id} = args;
    const message = await Message.findByPk(id);

    if (!message) throw new Error('Message not found!');

    return message;
  }),
  messages: authenticated(async (_, {filters: {limit}}) => {
    const messages = await Message.findAll({
      attributes: ['id', 'username', 'content', 'createdAt'],
      limit: limit ? limit : 50,
      order: [['createdAt', 'ASC']],
    });

    if (!messages) throw new Error('Messages not found!');

    return messages;
  }),
};

export default messageQueries;
