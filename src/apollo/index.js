// Apollo settings
import { ApolloClient } from 'apollo-client';
import { ApolloLink } from 'apollo-link';
import { InMemoryCache } from 'apollo-cache-inmemory';

// Config
import uploadLink from './config/upload-link';
import wsLink from './config/ws-link';
import errorHandler from './config/error-handler';

const link = ApolloLink.from([errorHandler, wsLink, uploadLink]);

const client = new ApolloClient({
  link,
  cache: new InMemoryCache(),
  defaultOptions: {
    query: {
      fetchPolicy: 'network-only',
      errorPolicy: 'all'
    },
    mutate: {
      errorPolicy: 'all'
    }
  }
});

export default client;
