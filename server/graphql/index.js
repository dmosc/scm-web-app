import path from 'path';
import { ApolloServer } from 'apollo-server';
import { makeExecutableSchema } from 'graphql-tools';
import { importSchema } from 'graphql-import';
import schemaDirectives from './directives';
import context from './middleware/context';
import resolvers from './resolvers';

const typeDefs = importSchema(path.join(__dirname, './typedefs/index.graphql'));

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
  schemaDirectives
});

const server = new ApolloServer({
  schema,
  context,
  subscriptions: {
    onConnect: ({ token }) => ({ token })
  },
  cors: {
    origin: true,
    credentials: true
  }
});

export default server;
