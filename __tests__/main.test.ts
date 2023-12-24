import { driver, createServer } from '../src/newServer.js';
import {
  QueryRequirements,
  CreateRequirements,
  DeleteRequirements,
  UpdateRequirement,
  LinkRequirement,
} from './queries.js';

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
            title: 'Req1',
            description: 'description of Req1',
            children: {
              create: [
                {
                  node: {
                    description: 'description of Req1.1',
                    title: 'Req1.1',
                  },
                },
                {
                  node: {
                    description: 'description of Req1.2',
                    title: 'Req1.2',
                    children: {
                      create: [
                        {
                          node: {
                            description: 'description of Req1.2.1',
                            title: 'Req1.2.1',
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
            description: 'description of Req2',
          },
          {
            title: 'Req3',
            description: 'description of Req3',
          },
        ],
      },
    });
    expect(
      response.body.singleResult.data?.createRequirements?.info?.nodesCreated,
    ).toBe(6);
  });

  it('Can query specific requirement nodes', async () => {
    const response = await newServer.executeOperation({
      query: `query Requirements($where: RequirementWhere) {
          requirements(where: $where) {
            id
          }
        }
      `,
      variables: {
        where: {
          title: 'Req2',
        },
      },
    });

    expect(response.body.singleResult.data?.requirements[0].id).toMatch(
      /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/,
    );
  });

  it('Can update description of specific requirement nodes', async () => {
    const response_Req2 = await newServer.executeOperation({
      query: `query Requirements($where: RequirementWhere) {
        requirements(where: $where) {
          id
          createdAt
        }
      }`,
      variables: {
        where: {
          title: 'Req2',
        },
      },
    });
    const targetId = response_Req2.body.singleResult.data?.requirements[0].id;
    const targetCreatedAt =
      response_Req2.body.singleResult.data?.requirements[0].createdAt;

    const updateResponse = await newServer.executeOperation({
      query: UpdateRequirement,
      variables: {
        where: { id: targetId },
        update: { description: 'new description of requirement 2' },
      },
    });
    expect(
      updateResponse.body.singleResult.data?.updateRequirements.requirements[0]
        .description,
    ).toBe('new description of requirement 2');
    expect(
      updateResponse.body.singleResult.data?.updateRequirements.requirements[0]
        .createdAt,
    ).toBe(targetCreatedAt);
  });

  it('Can create new sub-requirements and link it to existing one', async () => {
    const response_Req2_2 = await newServer.executeOperation({
      query: `
        mutation CreateRequirements($input: [RequirementCreateInput!]!) {
          createRequirements(input: $input) {
            info {
              nodesCreated
            }
            requirements {
              id
            }
          }
        }
      `,
      variables: {
        input: [
          {
            title: 'Req2.2',
            description: 'description of Req2.2',
          },
        ],
      },
    });
    const idReq2_2 =
      response_Req2_2.body.singleResult.data?.createRequirements.requirements[0]
        .id;

    const response_Req2 = await newServer.executeOperation({
      query: `query Requirements($where: RequirementWhere) {
          requirements(where: $where) {
            id
            createdAt
          }
        }
      `,
      variables: {
        where: {
          title: 'Req2',
        },
      },
    });
    const idReq2 = response_Req2.body.singleResult.data?.requirements[0].id;

    await newServer.executeOperation({
      query: LinkRequirement,
      variables: {
        where: { id: idReq2_2 },
        connect: { parent: { where: { node: { id: idReq2 } } } },
      },
    });

    const finalResponse = await newServer.executeOperation({
      query: `query Query($where: RequirementWhere) {
          requirements(where: $where) {
            title
            children {
              id
              title
              description
            }
          }
        }
      `,
      variables: {
        where: {
          title: 'Req2',
        },
      },
    });
    expect(
      finalResponse.body.singleResult.data?.requirements[0].children[0].id,
    ).toBe(idReq2_2);
  });
});
