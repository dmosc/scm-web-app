import { onError } from 'apollo-link-error';

const errorHandler = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.map(e => console.error(e.message, e));
  }
  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
  }
});

export default errorHandler;
