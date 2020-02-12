import { createUploadLink } from 'apollo-upload-client';
import { SERVER_URI } from 'config';

const uploadLink = createUploadLink({
  uri: SERVER_URI,
  credentials: 'include'
});

export default uploadLink;
