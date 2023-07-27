import { driver, createServer } from '../src/newServer.js';
import {
  QueryRequirements,
  CreateRequirements,
  DeleteRequirements,
} from '../src/queries.js';

describe('Neo4j GraphQL integration tests', () => {
  let newServer;

  beforeAll(async () => {
    newServer = await createServer();

    await newServer.executeOperation({
      query: DeleteRequirements,
      variables: {},
    });
  });

  afterAll(async () => {
    await driver.close();
  });

  it('After initialization, there should be no data in the database', async () => {
    const response = await newServer.executeOperation({
      query: QueryRequirements,
      variables: {},
    });

    expect(response.body.kind).toBe('single');

    expect(response.body.singleResult.errors).toBeUndefined();
    expect(response.body.singleResult.data?.requirements).toHaveLength(0);
  });

  it('Can create nested requirement nodes', async () => {
    const response = await newServer.executeOperation({
      query: CreateRequirements,
      variables: {
        input: [
          {
            title: 'Requirement1',
            description: 'description requirement 1',
            children: {
              create: [
                {
                  node: {
                    description: 'descp 1.1',
                    title: 'req1.1',
                  },
                },
                {
                  node: {
                    description: 'descp 1.2',
                    title: 'req1.2',
                    children: {
                      create: [
                        {
                          node: {
                            description: 'descp 1.2.1',
                            title: 'req 1.2.1',
                          },
                        },
                      ],
                    },
                  },
                },
              ],
            },
          },
          {
            title: 'Req2',
            description: 'descp req 2',
          },
          {
            title: 'Req3',
            description: 'descp req 3',
          },
        ],
      },
    });
    expect(
      response.body.singleResult.data?.createRequirements?.info?.nodesCreated,
    ).toBe(6);
  });
});
