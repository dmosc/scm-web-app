import { compareSync as comparePasswords, hashSync as hash } from 'bcryptjs';
import { AuthenticationError } from 'apollo-server-core';
import jwt from 'jsonwebtoken';
import { User } from '../../../mongo-db/models';
import authenticated from '../../middleware/authenticated';
import { JWT_SECRET } from '../../../config';

const userMutations = {
  user: async (_, args) => {
    const user = new User({ ...args.user });

    user.password = hash(args.user.password, 10);
    user.username = args.user.username.toLowerCase().trim();
    user.email = args.user.email.toLowerCase().trim();

    await user.save();

    return user;
  },
  login: async (_, args) => {
    try {
      const user = await User.findOne({
        $or: [
          { username: args.user.usernameOrEmail.toLowerCase() },
          { email: args.user.usernameOrEmail.toLowerCase() }
        ]
      });

      if (!user || !comparePasswords(args.user.password, user.password)) {
        return new AuthenticationError('¡Usuario o contraseña incorrectos!');
      }

      const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
        expiresIn: 86400
      });

      return token;
    } catch (err) {
      throw new AuthenticationError(err);
    }
  },
  userEdit: authenticated(async (_, args) =>
    User.findOneAndUpdate({ _id: args.user.id }, { ...args.user }, { new: true })
  ),
  userDelete: authenticated(async (_, { id }, { req: { userRequesting } }) => {
    try {
      const userToDelete = await User.findById(id);

      if (userToDelete.role === 'ADMIN' && userRequesting.role !== 'ADMIN')
        return false;

      if ((userToDelete.role === 'ADMIN' || userToDelete.role === 'MANAGER') && userRequesting.role === 'SUPPORT')
        return false;

      await User.deleteById(id, userRequesting.id);
      return true;
    } catch (e) {
      return e;
    }
  }),
  userRestore: authenticated(async (_, { id }) => {
    try {
      const userToRestore = await User.findById(id);
      await userToRestore.restore();
      return true;
    } catch (e) {
      return e;
    }
  })
};

export default userMutations;
