import { gql } from 'graphql-tag';

export const DeleteUsers = gql`
  mutation DeleteUsers($where: UserWhere) {
    deleteUsers(where: $where) {
      nodesDeleted
      relationshipsDeleted
      bookmark
    }
  }
`;

export const QueryUsers = gql`
  query Users($where: UserWhere) {
    users(where: $where) {
      id
      name
      email
    }
  }
`

export const CreateUser = gql`
  mutation CreateUsers($input: [UserCreateInput!]!) {
    createUsers(input: $input) {
      info {
        nodesCreated
      }
      users {
        id
        name
        email
      }
    }
  }
`

// Although name of mutation endpoint is UpdateUsers, but it can only do single update as shown in https://neo4j.com/docs/graphql/current/mutations/update/#_single_update
export const UpdateUsers = gql`
  mutation UpdateUsers($where: UserWhere, $update: UserUpdateInput) {
    updateUsers(where: $where, update: $update) {
      info {
        nodesCreated
      }
      users {
        email
        id
        name
      }
    }
  }
`
