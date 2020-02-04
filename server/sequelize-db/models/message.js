import Sequelize from 'sequelize';
import sequelize from '../index';

const Message = sequelize.define('Message', {
  username: { type: Sequelize.TEXT, allowNull: false },
  content: { type: Sequelize.TEXT, allowNull: false }
});

export default Message;
