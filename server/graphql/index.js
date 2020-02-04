import path from "path";
import { ApolloServer, PubSub } from "apollo-server";
import { makeExecutableSchema } from "graphql-tools";
import { importSchema } from "graphql-import";
import schemaDirectives from "./directives";
import resolvers from "./resolvers";

const typeDefs = importSchema(path.join(__dirname, "./typedefs/index.graphql"));

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
  schemaDirectives
});

const pubsub = new PubSub();

setInterval(() => {
  console.log("NEW_MESSAGE: ", pubsub.ee.listenerCount("NEW_MESSAGE"));
  console.log("NEW_POST: ", pubsub.ee.listenerCount("NEW_POST"));
  console.log("NEW_TICKET: ", pubsub.ee.listenerCount("NEW_TICKET"));
  console.log("TICKET_UPDATE: ", pubsub.ee.listenerCount("TICKET_UPDATE"));
  console.log("ACTIVE_TICKETS: ", pubsub.ee.listenerCount("ACTIVE_TICKETS"));
  console.log("TURN_UPDATE: ", pubsub.ee.listenerCount("TURN_UPDATE"));
}, 1000);

const server = new ApolloServer({
  schema,
  context: ({ req, res }) => {
    return { req, res, pubsub };
  },
  cors: {
    origin: "*",
    credentials: true
  }
});

export default server;
