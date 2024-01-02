import { v4 as uuidv4 } from 'uuid';
import { createServer, driver } from '../newServer.js';
import {
  CreateRequirements,
  DeleteRequirements,
  QueryRequirements,
} from './requirementQueries.js';
import { CreateUser, DeleteUsers } from './userQueries.js';

const checkTimeStampIsWithinLastMinute = (
  timestamp: number | string | Date,
): boolean => {
  const timeNow = new Date();
  const timeNowMinusMinutes = new Date();
  timeNowMinusMinutes.setMinutes(timeNow.getMinutes() - 1);
  return (
    new Date(timestamp) <= timeNow && new Date(timestamp) >= timeNowMinusMinutes
  );
};

describe('GraphRQ Requirement Node integration tests', () => {
  let newServer;

  beforeAll(async () => {
    newServer = await createServer();
  });

  beforeEach(async () => {
    await newServer.executeOperation({
      query: DeleteRequirements,
      variables: {},
    });

    await newServer.executeOperation({
      query: DeleteUsers,
      variables: {},
    });
  });

  afterAll(async () => {
    await driver.close();
  });

  it('After initialization, there should be no data about requirement in the database', async () => {
    const response = await newServer.executeOperation({
      query: QueryRequirements,
      variables: {},
    });

    expect(response.body.kind).toBe('single');

    expect(response.body.singleResult.errors).toBeUndefined();
    expect(response.body.singleResult.data?.requirements).toHaveLength(0);
  });

  describe('When create a single standalone requirement node (without connecting other nodes)', () => {
    describe(`Positive tests`, () => {
      it('should be able to create a requirement node with required field (i.e. title)', async () => {
        // Step 1: create a requirement node with name and description (required fields)
        const response = await newServer.executeOperation({
          query: CreateRequirements,
          variables: {
            input: [
              {
                title: 'Req1',
              },
            ],
          },
        });

        // Step 2: check if the node is created successfully
        const info = response.body.singleResult.data?.createRequirements?.info;
        const requirements =
          response.body.singleResult.data?.createRequirements?.requirements;
        expect(info?.nodesCreated).toBe(1);
        expect(requirements?.[0]?.title).toBe('Req1');
        expect(requirements?.[0]?.description).toBeNull();

        const isCreatedAtRecent = checkTimeStampIsWithinLastMinute(
          requirements?.[0]?.createdAt,
        );
        expect(isCreatedAtRecent).toBe(true);
      });

      it('should be able to create a requirement node with optional field (i.e. description)', async () => {
        // Step 1: create a requirement node with name and description (required fields)
        const response = await newServer.executeOperation({
          query: CreateRequirements,
          variables: {
            input: [
              {
                title: 'Req2',
                description: 'description of Req2',
              },
            ],
          },
        });

        // Step 2: check if the node is created successfully
        const info = response.body.singleResult.data?.createRequirements?.info;
        const requirements =
          response.body.singleResult.data?.createRequirements?.requirements;
        expect(info?.nodesCreated).toBe(1);
        expect(requirements?.[0]?.description).toBe('description of Req2');
      });
    });

    describe('Negative tests', () => {
      it('should fail in creating Requirement with Missing Title', async () => {
        const response = await newServer.executeOperation({
          query: CreateRequirements,
          variables: {
            input: [
              {
                description: 'description of Req1',
              },
            ],
          },
        });

        expect(response.body.singleResult.errors).toBeDefined();
        expect(response.body.singleResult.errors).toHaveLength(1);
        expect(response.body.singleResult.errors[0].message).toBe(
          `Variable "$input" got invalid value { description: "description of Req1" } at "input[0]"; Field "title" of required type "String!" was not provided.`,
        );
      });

      it('should fail to create Requirement with Invalid Field Title (e.g. title in number)', async () => {
        // Step 1: create a requirement node with id, name and description
        const response = await newServer.executeOperation({
          query: CreateRequirements,
          variables: {
            input: [
              {
                title: 1,
                description: 'description of Req1',
              },
            ],
          },
        });

        // Step 2: check if the node is created successfully
        expect(response.body.singleResult.errors).toBeDefined();
        expect(response.body.singleResult.errors).toHaveLength(1);
        expect(response.body.singleResult.errors[0].message).toContain(
          `String cannot represent a non string value: 1`,
        );
      });

      it('should fail to create Requirement with Future createdAt Date', async () => {
        const response = await newServer.executeOperation({
          query: CreateRequirements,
          variables: {
            input: [
              {
                title: 'Req1',
                createdAt: '2050-01-01T00:00:00.000Z',
              },
            ],
          },
        });

        expect(response.body.singleResult.errors).toBeDefined();
        expect(response.body.singleResult.errors).toHaveLength(1);
        expect(response.body.singleResult.errors[0].message).toContain(
          `Field "createdAt" is not defined by type "RequirementCreateInput"`,
        );
      });
    });
  });

  describe('When creating a requirement node and try to connect it with other nodes', () => {
    describe('Connect with user node', () => {
      describe('Positive tests', () => {
        describe('When try to connect with non-existing user node', () => {
          it('should create the requirement node but not connect it to the non-existing user node', async () => {
            // Step 1: create a requirement node with name and description (required fields)
            const response = await newServer.executeOperation({
              query: CreateRequirements,
              variables: {
                input: [
                  {
                    title: 'Req3',
                    description: 'description of Req3',
                    creator: {
                      connect: {
                        where: {
                          node: {
                            id: uuidv4(),
                          },
                        },
                      },
                    },
                  },
                ],
              },
            });

            // Step 2: check if the node is created successfully
            const info =
              response.body.singleResult.data?.createRequirements?.info;
            const requirements =
              response.body.singleResult.data?.createRequirements?.requirements;
            expect(info?.nodesCreated).toBe(1);
            expect(requirements?.[0]?.description).toBe('description of Req3');
            expect(requirements?.[0]?.creator).toBeNull();
          });
        });

        describe('When try to connect with existing user node', () => {
          it('should create the requirement node and connect it to the existing user node', async () => {
            // Step 1: create a user node
            const userResponse = await newServer.executeOperation({
              query: CreateUser,
              variables: {
                input: [
                  {
                    name: 'UserTest',
                    email: 'usertest@graphrq.com',
                  },
                ],
              },
            });
            expect(userResponse.body.singleResult.errors).toBeUndefined();
            const userId =
              userResponse.body.singleResult.data?.createUsers.users[0].id;

            // Step 2: create a requirement node and connect it to the existing user node
            const response = await newServer.executeOperation({
              query: CreateRequirements,
              variables: {
                input: [
                  {
                    title: 'Req4',
                    description: 'description of Req4',
                    creator: {
                      connect: {
                        where: {
                          node: {
                            id: userId,
                          },
                        },
                      },
                    },
                  },
                ],
              },
            });

            // Step 3: check if the node is created successfully
            const info =
              response.body.singleResult.data?.createRequirements?.info;
            const requirements =
              response.body.singleResult.data?.createRequirements?.requirements;
            expect(info?.nodesCreated).toBe(1);
            expect(requirements?.[0]?.description).toBe('description of Req4');
            expect(requirements?.[0]?.creator?.id).toBe(userId);
          });
        });

        describe('When try to connect with a new user node that created in the same request', () => {
          it('should create the requirement node and connect it to the new user node using connectOrCreate', async () => {
            // Step 1: create a requirement node and connect it to the new user node
            const response = await newServer.executeOperation({
              query: CreateRequirements,
              variables: {
                input: [
                  {
                    title: 'Req5',
                    description: 'description of Req5',
                    creator: {
                      connectOrCreate: {
                        onCreate: {
                          node: {
                            name: 'UserTest2',
                            email: 'usertest2@graphrq.com',
                          },
                        },
                        where: {
                          node: {
                            email: 'usertest2@graphrq.com',
                          },
                        },
                      },
                    },
                  },
                ],
              },
            });

            // Step 2: check if the node is created successfully
            const info =
              response.body.singleResult.data?.createRequirements?.info;
            const requirements =
              response.body.singleResult.data?.createRequirements?.requirements;
            expect(info?.nodesCreated).toBe(2);
            expect(requirements?.[0]?.description).toBe('description of Req5');
            expect(requirements?.[0]?.creator?.name).toBe('UserTest2');
            expect(requirements?.[0]?.creator?.email).toBe(
              'usertest2@graphrq.com',
            );
          });

          it('should create the requirement node and connect it to the new user node using create', async () => {
            // Step 1: create a requirement node and connect it to the new user node
            const response = await newServer.executeOperation({
              query: CreateRequirements,
              variables: {
                input: [
                  {
                    title: 'Req5',
                    description: 'description of Req5',
                    creator: {
                      create: {
                        node: {
                          name: 'UserTest2',
                          email: 'usertest2@graphrq.com',
                        },
                      },
                    },
                  },
                ],
              },
            });

            // Step 2: check if the node is created successfully
            const info =
              response.body.singleResult.data?.createRequirements?.info;
            const requirements =
              response.body.singleResult.data?.createRequirements?.requirements;
            expect(info?.nodesCreated).toBe(2);
            expect(requirements?.[0]?.description).toBe('description of Req5');
            expect(requirements?.[0]?.creator?.name).toBe('UserTest2');
            expect(requirements?.[0]?.creator?.email).toBe(
              'usertest2@graphrq.com',
            );
          });
        });
      });
    });

    describe('Connect with other requirement node', () => {
      describe('Positive tests', () => {
        describe('When try to connect with existing child requirement node', () => {
          it('should create the requirement node and connect it to the existing child requirement node', async () => {
            // Step 1: create a requirement node
            const childRequirementResponse = await newServer.executeOperation({
              query: CreateRequirements,
              variables: {
                input: [
                  {
                    title: 'Req9',
                    description: 'description of Req9',
                  },
                ],
              },
            });
            expect(
              childRequirementResponse.body.singleResult.errors,
            ).toBeUndefined();
            const childRequirementId =
              childRequirementResponse.body.singleResult.data.createRequirements
                ?.requirements[0].id;

            // Step 2: create a new requirement and connect the existing requirement as children
            const response = await newServer.executeOperation({
              query: CreateRequirements,
              variables: {
                input: [
                  {
                    title: 'Req10',
                    children: {
                      connect: {
                        where: {
                          node: {
                            id: childRequirementId,
                          },
                        },
                      },
                    },
                  },
                ],
              },
            });

            // Step 3: check if the node is created successfully
            const info =
              response.body.singleResult.data?.createRequirements?.info;
            const requirements =
              response.body.singleResult.data?.createRequirements?.requirements;
            expect(info?.nodesCreated).toBe(1);
            expect(requirements?.[0]?.title).toBe('Req10');
            expect(requirements?.[0]?.children[0]?.id).toBe(childRequirementId);
          });
        });

        describe('When try to connect with new child requirement node that created in the same request', () => {
          it('should create the requirement node and connect it to the new child requirement node using connectOrCreate', async () => {
            // Step 1: create a requirement node and connect it to the new child requirement node
            const response = await newServer.executeOperation({
              query: CreateRequirements,
              variables: {
                input: [
                  {
                    title: 'Req11',
                    children: {
                      create: {
                        node: {
                          title: 'Req11-Child',
                        },
                      },
                    },
                  },
                ],
              },
            });

            // Step 2: check if nodes is created successfully
            const info =
              response.body.singleResult.data?.createRequirements?.info;
            const requirements =
              response.body.singleResult.data?.createRequirements?.requirements;
            expect(info?.nodesCreated).toBe(2);
            expect(requirements?.[0]?.title).toBe('Req11');
            expect(requirements?.[0]?.children[0]?.title).toBe('Req11-Child');
          });
        });
      });
    });
  });
});
