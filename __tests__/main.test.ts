import { createServer } from '../src/newServer.js';
import { DeleteRQNodeDocument, QueryRQNodeDocument } from '../src/queries.js';

describe('Neo4j GraphQL integration tests', () => {
  let newServer;

  beforeAll(async () => {
    newServer = await createServer();

    // clear database about books
    await newServer.executeOperation({
      query: DeleteRQNodeDocument,
      variables: {},
    });
  });

  it('After initialization, there should be no data in the database', async () => {
    const response = await newServer.executeOperation({
      query: QueryRQNodeDocument,
      variables: {},
    });

    expect(response.body.kind).toBe('single');

    expect(response.body.singleResult.errors).toBeUndefined();
    expect(response.body.singleResult.data?.rqNodes).toHaveLength(0);
  });
});
