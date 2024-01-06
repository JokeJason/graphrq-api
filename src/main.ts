import { startStandaloneServer } from '@apollo/server/standalone';

import { createServer, session } from './newServer.js';

const server = await createServer();

const { url } = await startStandaloneServer(server, {
  context: async ({ req }) => ({ req, executionContext: session }),
  listen: { port: 4000 },
});

console.log(`🚀 Server ready at ${url}`);
