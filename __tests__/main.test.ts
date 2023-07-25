import { createServer } from '../src/newServer.js';
import { QueryRequirements, QueryUsers, CreateUser } from '../src/queries.js';

describe('Neo4j GraphQL integration tests', () => {
  let newServer;

  beforeAll(async () => {
    newServer = await createServer();
  });

  it('After initialization, there should be no data in the database', async () => {
    const responseQueryRequirements = await newServer.executeOperation({
      query: QueryRequirements,
      variables: {},
    });
    expect(responseQueryRequirements.body.kind).toBe('single');
    expect(responseQueryRequirements.body.singleResult.errors).toBeUndefined();
    expect(
      responseQueryRequirements.body.singleResult.data?.requirements,
    ).toHaveLength(0);

    const responseQueryUsers = await newServer.executeOperation({
      query: QueryUsers,
      variables: {},
    });
    expect(responseQueryUsers.body.kind).toBe('single');
    expect(responseQueryUsers.body.singleResult.errors).toBeUndefined();
    expect(responseQueryUsers.body.singleResult.data?.users).toHaveLength(0);
  });

  it('Should be able to create multiple user', async () => {
    const responseCreateUser = await newServer.executeOperation({
      query: CreateUser,
      variables: { input: [{ name: 'John Doe' }, { name: 'Jane Doe' }] },
    });
    expect(
      responseCreateUser.body.singleResult.data?.createUsers.users,
    ).toHaveLength(2);

    const responseQueryUsers = await newServer.executeOperation({
      query: `query Users { users { name } }`,
      variables: {},
    });
    expect(responseQueryUsers.body.singleResult.data?.users).toContainEqual({
      name: 'Jane Doe',
    });
    expect(responseQueryUsers.body.singleResult.data?.users).toContainEqual({
      name: 'John Doe',
    });
  });

  it('Created users should be created with id', async () => {
    const responseCreateUser = await newServer.executeOperation({
      query: CreateUser,
      variables: { input: { name: 'John Doe' } },
    });
    expect(
      responseCreateUser.body.singleResult.data?.createUsers.users,
    ).toHaveLength(1);
    const responseQueryUsers = await newServer.executeOperation({
      query: `query Users { users { id, name } }`,
      variables: {},
    });
    expect(responseQueryUsers.body.singleResult.data?.users[0].name).toBe(
      'John Doe',
    );
    expect(responseQueryUsers.body.singleResult.data?.users[0].id).toMatch(
      /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/,
    );
  });
});
