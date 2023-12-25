import { driver, createServer } from '../newServer.js';
import {
  DeleteUsers,
  CreateUser,
  QueryUsers,
  UpdateUsers,
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

    it('Can create a single user', async () => {
      const response = await newServer.executeOperation({
        query: CreateUser,
        variables: {
          input: [
            {
              name: 'User1',
              email: 'user1@graphrq.com.au',
            }
          ]
        }
      });

      expect(response.body.kind).toBe('single');
      expect(response.body.singleResult.errors).toBeUndefined();
      expect(response.body.singleResult.data?.createUsers.users).toHaveLength(1);
      const user = response.body.singleResult.data?.createUsers.users[0];
      expect(user.name).toBe('User1');
      expect(user.email).toBe('user1@graphrq.com.au');
    });

    it('Can create multiple users', async () => {
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
            }
          ]
        }
      });

      expect (response.body.kind).toBe('single');
      expect (response.body.singleResult.errors).toBeUndefined();
      expect (response.body.singleResult.data?.createUsers.users).toHaveLength(2);
      const users = response.body.singleResult.data?.createUsers.users;
      expect(users[0].name).toBe('User2');
      expect(users[0].email).toBe('user2@graphrq.com.au');
      expect(users[1].name).toBe('User3');
      expect(users[1].email).toBe('user3@graphrq.com.au');
    });

    it('Can update a user', async () => {
      // first retrieve the first user
      const response = await newServer.executeOperation({
        query: QueryUsers,
        variables: {},
      });
      // get the first user
      const user1 = response.body.singleResult.data?.users[0];
      // update the user
      const updateResponse = await newServer.executeOperation({
        query: UpdateUsers,
        variables: {
          where: {
            id: user1.id,
          },
          update: {
            name: 'User1Updated'
          }
        }
      })

      expect(updateResponse.body.kind).toBe('single');
      expect(updateResponse.body.singleResult.errors).toBeUndefined();
      expect(updateResponse.body.singleResult.data?.updateUsers.users).toHaveLength(1);
      const updatedUser = updateResponse.body.singleResult.data?.updateUsers.users[0];
      expect(updatedUser.name).toBe('User1Updated');

      // check that the user has been updated
      const queryResponse = await newServer.executeOperation({
        query: QueryUsers,
        variables: {
          where: {
            id: user1.id,
          },
          update: {
            name: 'User1Updated'
          }
        },
      });

      expect(queryResponse.body.kind).toBe('single');
      expect(queryResponse.body.singleResult.errors).toBeUndefined();
      expect(queryResponse.body.singleResult.data?.users[0].name).toBe('User1Updated');
    });

    it('Can delete a user', async () => {
      // first retrieve the first user
      const response = await newServer.executeOperation({
        query: QueryUsers,
        variables: {},
      });
      // get the first user
      const user = response.body.singleResult.data?.users[0];
      // delete the user
      const deleteResponse = await newServer.executeOperation({
        query: DeleteUsers,
        variables: {
          where: {
            id: user.id,
          }
        }
      });
      // check nodesDeleted is 1
      expect(deleteResponse.body.kind).toBe('single');
      // check that the user has been deleted
      const queryResponse = await newServer.executeOperation({
        query: QueryUsers,
        variables: {},
      });
      // get the first user
      const users = queryResponse.body.singleResult.data?.users;
      expect(users).toHaveLength(2);
    });
});
