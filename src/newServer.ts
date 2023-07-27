import neo4j from 'neo4j-driver';
import { Neo4jGraphQL } from '@neo4j/graphql';
import { ApolloServer } from '@apollo/server';
import 'dotenv/config.js';

import { typeDefs } from './typeDefs.js';

export const driver = neo4j.driver(
  process.env.DB_URI,
  neo4j.auth.basic(process.env.DB_USER, process.env.DB_PASSWORD),
);

const neoSchema = new Neo4jGraphQL({ typeDefs, driver });

export async function createServer(): Promise<ApolloServer> {
  return new ApolloServer({
    schema: await neoSchema.getSchema(),
  });
}
