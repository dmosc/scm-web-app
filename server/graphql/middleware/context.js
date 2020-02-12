import jwt from 'jsonwebtoken';
import cookie from 'cookie';
import { JWT_SECRET } from 'config';
import { PubSub } from 'apollo-server';

const pubsub = new PubSub();

const setContext = ({ req = {}, res, connection }) => {
  // Connection is sent by websockets. This protocol
  // doesn't handle cookies and req, so we're faking it
  // in order to pass auth directive

  let token;

  if (connection) {
    token = connection.context.token;
  } else {
    ({ token } = cookie.parse(req.headers.cookie || ''));
  }

  // Only set userRequesting payload is token is present
  // This way, non authenticated queries can work correctly
  // and the userRequesting.id will be present on every query
  // to use it in the .deleteBy({userRequesting.id})
  if (token) {
    const payload = jwt.verify(token, JWT_SECRET);
    req.userRequesting = payload;
  }

  return { req, res, pubsub };
};

export default setContext;
