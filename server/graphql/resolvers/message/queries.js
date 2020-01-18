import {Message} from '../../../sequelize-db/models';
import authenticated from '../../middleware/authenticated';

const messageQueries = {
  message: authenticated(async (_, args) => {
    const {id} = args;
    const message = await Message.findByPk(id);

    if (!message) throw new Error('¡No se ha podido encontrar el mensaje!');

    return message;
  }),
  messages: authenticated(async (_, {filters: {limit}}) => {
    const messages = await Message.findAll({
      attributes: ['id', 'username', 'content', 'createdAt'],
      limit: limit ? limit : 50,
      order: [['createdAt', 'ASC']],
    });

    if (!messages) throw new Error('¡No se han podido cargar los mensajes!');

    return messages;
  }),
};

export default messageQueries;
