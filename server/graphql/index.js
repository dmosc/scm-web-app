import path from 'path';
import {ApolloServer, PubSub} from 'apollo-server';
import {makeExecutableSchema} from 'graphql-tools';
import {importSchema} from 'graphql-import';
import schemaDirectives from './directives';
import resolvers from './resolvers';

const typeDefs = importSchema(path.join(__dirname, './typedefs/index.graphql'));

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
  schemaDirectives,
});

const pubsub = new PubSub();

const server = new ApolloServer({
  schema,
  context: ({req, res}) => ({req, res, pubsub}),
  cors: {
    origin: '*',
    credentials: true,
  },
});

export default server;
