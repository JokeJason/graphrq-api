import { createServer, driver } from '../newServer.js';
import {
  CreateUser,
  DeleteUsers,
  QueryUsers,
  UpdateUsers,
  UsersAggregate,
} from './userQueries.js';

describe('GraphRQ Users integration tests', () => {
  let newServer;

  beforeAll(async () => {
    newServer = await createServer();

    await newServer.executeOperation({
      query: DeleteUsers,
      variables: {},
    });
  });

  afterAll(async () => {
    await driver.close();
  });

  it('After initialization, there should be no data in the database', async () => {
    const response = await newServer.executeOperation({
      query: QueryUsers,
      variables: {},
    });

    expect(response.body.kind).toBe('single');
    expect(response.body.singleResult.errors).toBeUndefined();
    expect(response.body.singleResult.data?.users).toHaveLength(0);
  });

  describe('Can create a user', () => {
    describe('Positive tests', () => {
      it('Can create a single user', async () => {
        // Step 1: create a user
        const response = await newServer.executeOperation({
          query: CreateUser,
          variables: {
            input: [
              {
                name: 'User1',
                email: 'user1@graphrq.com.au',
              },
            ],
          },
        });

        // Step 2: verify response includes correct user data
        expect(response.body.kind).toBe('single');
        expect(response.body.singleResult.errors).toBeUndefined();
        expect(response.body.singleResult.data?.createUsers.users).toHaveLength(
          1,
        );
        const user = response.body.singleResult.data?.createUsers.users[0];
        expect(user.name).toBe('User1');
        expect(user.email).toBe('user1@graphrq.com.au');

        // Step 3: Perform a 'query' operation to verify that the user has been created
        const queryResponse = await newServer.executeOperation({
          query: QueryUsers,
          variables: {
            where: {
              id: user.id,
            },
          },
        });
        expect(queryResponse.body.kind).toBe('single');
        expect(queryResponse.body.singleResult.errors).toBeUndefined();
        expect(queryResponse.body.singleResult.data?.users[0].name).toBe(
          'User1',
        );
      });
    });

    describe('Negative tests', () => {
      it('Invalid input test', async () => {
        // Objective: Ensure that the system rejects the creation of a user with invalid input (e.g., missing email).

        // Step 1: Attempt to create a user with invalid input
        const response = await newServer.executeOperation({
          query: CreateUser,
          variables: {
            input: [
              {
                name: 'UserInvalid',
              },
            ],
          },
        });

        // Step 2: Verify that the system rejects the invalid input
        expect(response.body.kind).toBe('single');
        expect(response.body.singleResult.errors).toHaveLength(1);
        expect(response.body.singleResult.errors[0].message).toBe(
          'Variable "$input" got invalid value { name: "UserInvalid" } at "input[0]"; Field "email" of required type "String!" was not provided.',
        );
      });

      it('Duplicate user test', async () => {
        // Objective: Ensure that the system rejects the creation of a user with duplicate email.

        // Step 1: Create first user
        await newServer.executeOperation({
          query: CreateUser,
          variables: {
            input: [
              {
                name: 'UserDuplicate1',
                email: 'userduplicate@graphrq.com.au',
              },
            ],
          },
        });

        // Step 2: Attempt to create second user with duplicate email
        const response = await newServer.executeOperation({
          query: CreateUser,
          variables: {
            input: [
              {
                name: 'UserDuplicate2',
                email: 'userduplicate@graphrq.com.au',
              },
            ],
          },
        });

        // Step 3: Verify that the system rejects the duplicate email
        expect(response.body.kind).toBe('single');
        expect(response.body.singleResult.errors).toHaveLength(1);
        expect(response.body.singleResult.errors[0].message).toBe(
          'Constraint validation failed',
        );
      });

      it('Invalid email test', async () => {
        // Objective: Ensure that the system rejects the creation of a user with invalid email.

        // Step 1: Attempt to create a user with invalid email
        const response = await newServer.executeOperation({
          query: CreateUser,
          variables: {
            input: [
              {
                name: 'UserInvalidEmail',
                email: 'userinvalidemail',
              },
            ],
          },
        });

        // Step 2: Verify that the system rejects the invalid email
        expect(response.body.kind).toBe('single');
        expect(response.body.singleResult.errors).toHaveLength(1);
        expect(response.body.singleResult.errors[0].message).toBe(
          'Value userinvalidemail is not a valid email',
        );
      });
    });
  });

  it('Can create multiple users', async () => {
    // Step 1: create two users
    const response = await newServer.executeOperation({
      query: CreateUser,
      variables: {
        input: [
          {
            name: 'User2',
            email: 'user2@graphrq.com.au',
          },
          {
            name: 'User3',
            email: 'user3@graphrq.com.au',
          },
        ],
      },
    });

    // Step 2: verify response includes correct user data
    expect(response.body.kind).toBe('single');
    expect(response.body.singleResult.errors).toBeUndefined();
    expect(response.body.singleResult.data?.createUsers.users).toHaveLength(2);
    const users = response.body.singleResult.data?.createUsers.users;
    expect(users[0].name).toBe('User2');
    expect(users[0].email).toBe('user2@graphrq.com.au');
    expect(users[1].name).toBe('User3');
    expect(users[1].email).toBe('user3@graphrq.com.au');

    // Step 3: Perform a 'query' operation to verify that the users have been created
    const queryResponse = await newServer.executeOperation({
      query: QueryUsers,
      variables: {
        where: {
          id_IN: [users[0].id, users[1].id],
        },
      },
    });
    expect(queryResponse.body.kind).toBe('single');
    expect(queryResponse.body.singleResult.errors).toBeUndefined();
    expect(queryResponse.body.singleResult.data?.users).toHaveLength(2);
  });

  it('Can update a user', async () => {
    // Step 1: Create a user using the 'create' operation
    const createResponse = await newServer.executeOperation({
      query: CreateUser,
      variables: {
        input: [
          {
            name: 'UserNew',
            email: 'usernew@graphrq.com.au',
          },
        ],
      },
    });
    const newUser = createResponse.body.singleResult.data?.createUsers.users[0];

    // Step 2: Update the user using the 'update' operation
    const updateResponse = await newServer.executeOperation({
      query: UpdateUsers,
      variables: {
        where: {
          id: newUser.id,
        },
        update: {
          name: 'newUserUpdated',
        },
      },
    });

    expect(updateResponse.body.kind).toBe('single');
    expect(updateResponse.body.singleResult.errors).toBeUndefined();
    expect(
      updateResponse.body.singleResult.data?.updateUsers.users,
    ).toHaveLength(1);
    const updatedUser =
      updateResponse.body.singleResult.data?.updateUsers.users[0];
    expect(updatedUser.name).toBe('newUserUpdated');

    // Step 3: Query the updated user to verify that the update has been performed
    const queryResponse = await newServer.executeOperation({
      query: QueryUsers,
      variables: {
        where: {
          id: newUser.id,
        },
      },
    });

    expect(queryResponse.body.kind).toBe('single');
    expect(queryResponse.body.singleResult.errors).toBeUndefined();
    expect(queryResponse.body.singleResult.data?.users[0].name).toBe(
      'newUserUpdated',
    );
  });

  it('Can delete a user', async () => {
    // Step 1: Create a user
    const createResponse = await newServer.executeOperation({
      query: CreateUser,
      variables: {
        input: [
          {
            name: 'UserToDelete',
            email: 'usertodelete@graphrq.com.au',
          },
        ],
      },
    });
    expect(createResponse.body.kind).toBe('single');
    expect(createResponse.body.singleResult.errors).toBeUndefined();
    expect(
      createResponse.body.singleResult.data?.createUsers.info.nodesCreated,
    ).toBe(1);
    const user = createResponse.body.singleResult.data?.createUsers.users[0];

    // Step 2: Delete the user
    const deleteResponse = await newServer.executeOperation({
      query: DeleteUsers,
      variables: {
        where: {
          id: user.id,
        },
      },
    });
    expect(deleteResponse.body.kind).toBe('single');
    expect(deleteResponse.body.singleResult.errors).toBeUndefined();
    expect(
      deleteResponse.body.singleResult.data?.deleteUsers.nodesDeleted,
    ).toBe(1);

    // Step 3: Attempt to query the deleted user, and verify that it does not exist
    const queryResponse = await newServer.executeOperation({
      query: QueryUsers,
      variables: {
        where: {
          id: user.id,
        },
      },
    });
    expect(queryResponse.body.kind).toBe('single');
    expect(queryResponse.body.singleResult.errors).toBeUndefined();
    expect(queryResponse.body.singleResult.data?.users).toHaveLength(0);
  });

  it('Can aggregate users', async () => {
    // Step 0: delete all users
    const deleteResponse = await newServer.executeOperation({
      query: DeleteUsers,
      variables: {},
    });
    expect(deleteResponse.body.kind).toBe('single');
    expect(deleteResponse.body.singleResult.errors).toBeUndefined();

    // Step 1: Create three users
    await newServer.executeOperation({
      query: CreateUser,
      variables: {
        input: [
          {
            name: 'User4',
            email: 'user4@graphrq.com.au',
          },
          {
            name: 'User5',
            email: 'user5@graphrq.com.au',
          },
          {
            name: 'User6',
            email: 'user6@graphrq.com.au',
          },
        ],
      },
    });

    // Step 2: Aggregate the users to count the number of users
    const aggregateResponse = await newServer.executeOperation({
      query: UsersAggregate,
      variables: {},
    });
    expect(aggregateResponse.body.kind).toBe('single');
    expect(aggregateResponse.body.singleResult.errors).toBeUndefined();
    expect(aggregateResponse.body.singleResult.data?.usersAggregate.count).toBe(
      3,
    );
  });
});
