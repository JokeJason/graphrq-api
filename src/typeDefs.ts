import { gql } from 'graphql-tag';

export const typeDefs = gql`
  type User {
    id: ID! @id
    name: String!
    requirements: [Requirement!]! @relationship(type: "CREATED", direction: OUT)
  }

  type Requirement {
    id: ID!
    title: String!
    description: String!
    creator: User @relationship(type: "CREATED", direction: IN)
    createdAt: DateTime! @timestamp(operations: [CREATE])
    updatedAt: DateTime @timestamp(operations: [UPDATE])
    parent: Requirement @relationship(type: "CHILD_OF", direction: OUT)
    children: [Requirement!]! @relationship(type: "CHILD_OF", direction: IN)
  }
`;
