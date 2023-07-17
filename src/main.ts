import { startStandaloneServer } from '@apollo/server/standalone';

import { createServer } from './newServer.js';

const server = await createServer();

const { url } = await startStandaloneServer(server, {
  context: async ({ req }) => ({ req }),
  listen: { port: 4000 },
});

console.log(`🚀 Server ready at ${url}`);
