import {Message} from '../../../sequelize-db/models';
import authenticated from '../../middleware/authenticated';

const messageMutations = {
  message: authenticated(async (_, args, {pubsub}) => {
    const message = Message.create({...args.message});

    if (!message) throw new Error('¡Hubo un error creando el mensaje!');

    pubsub.publish('NEW_MESSAGE', {
      newMessage: message,
    });

    return message;
  }),
};

export default messageMutations;
