import jwt from 'jsonwebtoken';
import { AuthenticationError } from 'apollo-server-errors';
import { JWT_SECRET } from '../../config';

const authenticated = next => (_, args, { req, res, pubsub }) => {
  const { authentication } = req.headers;

  if (authentication) {
    const token = authentication.split('Bearer ')[1];

    if (token) {
      try {
        jwt.verify(token, JWT_SECRET);
        return next(_, args, { req, res, pubsub });
      } catch (e) {
        throw new AuthenticationError('Invalid/Expired token');
      }
    }

    throw new Error("Authentication token 'Bearer [token] '");
  }

  throw new Error('Authentication header must be provided');
};

export default authenticated;
