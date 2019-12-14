import app from '../app';
import path from 'path';
import {ApolloServer} from 'apollo-server-express';
import {makeExecutableSchema} from 'graphql-tools';
import {importSchema} from 'graphql-import';
import resolvers from './resolvers';

const typeDefs = importSchema(path.join(__dirname, './typedefs/index.graphql'));

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

const server = new ApolloServer({
  schema,
  context: ({req, res}) => ({req, res}),
});

server.applyMiddleware({app, cors: {origin: '*', credentials: true}});

export default server;
