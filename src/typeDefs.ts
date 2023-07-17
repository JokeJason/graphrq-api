import { gql } from 'graphql-tag';

export const typeDefs = gql`
  type RQNode {
    title: String!
    description: String
    id: ID! @id
    createdAt: DateTime! @timestamp(operations: [CREATE])
    updatedAt: DateTime @timestamp(operations: [UPDATE])
  }
`;
