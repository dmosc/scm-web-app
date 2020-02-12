import cookie from 'react-cookies';
import { WebSocketLink } from 'apollo-link-ws';
import { WS_URI } from 'config';

const token = cookie.load('token');

const wsLink = new WebSocketLink({
  uri: WS_URI,
  options: {
    connectionParams: {
      token
    }
  }
});

export default wsLink;
