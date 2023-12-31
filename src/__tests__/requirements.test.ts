import { v4 as uuidv4 } from 'uuid';
import { createServer, driver } from '../newServer.js';
import {
  CreateRequirements,
  DeleteRequirements,
  QueryRequirements,
} from './requirementQueries.js';

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

    await newServer.executeOperation({
      query: DeleteRequirements,
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

      it('should fail to create Requirement with Invalid creator ID', async () => {
        // create a random uuid
        const randomUserId = uuidv4();

        // Step 2: create a requirement node with invalid creator ID
        const response = await newServer.executeOperation({
          query: CreateRequirements,
          variables: {
            input: [
              {
                title: 'Req1',
                description: 'description of Req1',
                creator: {
                  connectOrCreate: {
                    where: {
                      node: {
                        id: randomUserId,
                      },
                    },
                  },
                },
              },
            ],
          },
        });

        const errors = response.body.singleResult.errors;
        expect(errors).toBeDefined();
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toContain(
          "Cannot read property 'id' of null",
        );
      });
    });
  });
  describe('When creating a requirement node and try to connect it with an non-existing user node', () => {
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
      const info = response.body.singleResult.data?.createRequirements?.info;
      const requirements =
        response.body.singleResult.data?.createRequirements?.requirements;
      expect(info?.nodesCreated).toBe(1);
      expect(requirements?.[0]?.description).toBe('description of Req3');
      expect(requirements?.[0]?.creator).toBeNull();
    });
  });
});
