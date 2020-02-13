import { compareSync as comparePasswords, hashSync as hash } from 'bcryptjs';
import { AuthenticationError } from 'apollo-server-core';
import jwt from 'jsonwebtoken';
import { User } from '../../../mongo-db/models';
import authenticated from '../../middleware/authenticated';
import { JWT_SECRET } from '../../../config';

const userMutations = {
  user: async (_, args) => {
    try {
      const user = new User({ ...args.user });

      user.password = hash(args.user.password, 10);
      user.username = args.user.username.toLowerCase().trim();
      user.email = args.user.email.toLowerCase().trim();

      await user.save();

      return user;
    } catch (e) {
      throw new Error(e);
    }
  },
  login: async (_, args, { res, req }) => {
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

      res.cookie('token', token, {
        maxAge: 86400 * 1000,
        domain: req.headers['X-Forwarded-Host'].split(':')[0]
      });

      return token;
    } catch (err) {
      throw new AuthenticationError(err);
    }
  },
  userEdit: authenticated(async (_, args) => {
    try {
      return await User.findOneAndUpdate({ _id: args.user.id }, { ...args.user }, { new: true });
    } catch (e) {
      return e;
    }
  })
};

export default userMutations;
