import { createUploadLink } from 'apollo-upload-client';
import cookie from 'react-cookies';
import { SERVER_URI } from 'config';

const token = cookie.load('token');

const uploadLink = createUploadLink({
  uri: SERVER_URI,
  credentials: 'include',
  headers: {
    authentication: token ? `Bearer ${token}` : undefined
  }
});

export default uploadLink;
