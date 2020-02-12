import { AuthenticationError } from 'apollo-server-errors';

const authenticated = next => (_, args, ctx) => {
  if (!ctx.req.userRequesting) {
    throw new AuthenticationError('You must be signed in to view this resource.');
  }

  return next(_, args, ctx);
};

export default authenticated;
