export const typeDefs = `#graphql
  type Requirement {
    id: ID! @id
    title: String!
    description: String
    createdAt: DateTime! @timestamp(operations: [CREATE])
    updatedAt: DateTime @timestamp(operations: [UPDATE])
    parent: Requirement @relationship(type: "CHILD_OF", direction: OUT)
    children: [Requirement!]! @relationship(type: "CHILD_OF", direction: IN)
  }
`;
