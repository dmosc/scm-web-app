import Sequelize from 'sequelize';
import sequelize from '../index';

const Post = sequelize.define('Post', {
  username: {type: Sequelize.TEXT, allowNull: false},
  title: {type: Sequelize.TEXT, allowNull: false},
  content: {type: Sequelize.TEXT, allowNull: false},
});

export default Post;
