import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { Neo4jGraphQL } from '@neo4j/graphql';
import neo4j from 'neo4j-driver';
import 'dotenv/config.js';
import { gql } from 'graphql-tag';

const typeDefs = gql`
  type RQNode {
    title: String!
    description: String
    id: ID! @id
    createdAt: DateTime! @timestamp(operations: [CREATE])
    updatedAt: DateTime @timestamp(operations: [UPDATE])
  }
`;

const driver = neo4j.driver(
  process.env.DB_URI,
  neo4j.auth.basic(process.env.DB_USER, process.env.DB_PASSWORD),
);

const neoSchema = new Neo4jGraphQL({ typeDefs, driver });

const server = new ApolloServer({ schema: await neoSchema.getSchema() });

const { url } = await startStandaloneServer(server, {
  context: async ({ req }) => ({ req }),
  listen: { port: 4000 },
});

console.log(`🚀 Server ready at ${url}`);
