import jwt from 'jsonwebtoken';
import { PubSub } from 'apollo-server';
import { JWT_SECRET } from '../../config';

const pubsub = new PubSub();

const setContext = ({ req = {}, res, connection }) => {
  // Connection is sent by websockets. This protocol
  // doesn't handle cookies and req, so we're faking it
  // in order to pass auth directive

  let token;

  if (connection) {
    token = connection.context.token;
  } else {
    const { authentication } = req.headers;
    if (authentication) [, token] = authentication.split('Bearer ');
  }

  // Only set userRequesting payload if token is present
  // This way, non authenticated queries can work correctly
  // and the userRequesting.id will be present on every query
  // to use it in the .deleteBy({userRequesting.id})
  if (token) {
    req.userRequesting = jwt.verify(token, JWT_SECRET);
  }

  return { req, res, pubsub };
};

export default setContext;
