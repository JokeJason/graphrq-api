import { ApolloServer } from '@apollo/server';
import 'dotenv/config.js';
import { Neo4jGraphQL } from '@neo4j/graphql';
import neo4j from 'neo4j-driver';
import { typeDefs } from './typeDefs.js';

export const driver = neo4j.driver(
  process.env.NEO4J_URI,
  neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD),
);

async function createSchema() {
  const neoSchema = new Neo4jGraphQL({ typeDefs, driver });
  const graphqlSchema = await neoSchema.getSchema();

  // Create constraints and indexes before ApolloServer is created
  await neoSchema.assertIndexesAndConstraints({ options: { create: true } });

  return graphqlSchema;
}

export async function createServer(): Promise<ApolloServer> {
  const schema = await createSchema();
  return new ApolloServer({
    schema: schema,
  });
}
