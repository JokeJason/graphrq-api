import { gql } from 'graphql-tag';

// Here is where we define data types of our Neo4j database. By using this type definition, Neo4jGraphQL library will
// automatically generate GraphQL schema for us (which can be retrieved in Apollo Sandbox).
// And because we are not defining a complete GraphQL DSL, we don't use .graphql file.

export const typeDefs = gql`
  type User {
    id: ID!
    name: String!
    email: String!
  }

  enum RequirementCategory {
    CUSTOMER
    SYSTEM
    ENGINEERING
    USER_STORY
    IMPLEMENTATION
    QUALITY_ASSURANCE
  }

  type Requirement {
    id: ID! @id
    name: String!
    description: String
    createdAt: DateTime! @timestamp(operations: [CREATE])
    creator: User @relationship(type: "CREATED", direction: IN)
    updatedAt: DateTime! @timestamp(operations: [UPDATE])
    parent: Requirement @relationship(type: "CHILD_OF", direction: OUT)
    children: [Requirement!]! @relationship(type: "CHILD_OF", direction: IN)
    tests: [Test!]! @relationship(type: "TESTED_BY", direction: IN)
  }

  enum TestCategory {
    UNIT_TEST
    INTEGRATION_TEST
    SYSTEM_TEST
  }

  enum TestStatus {
    PASSED
    FAILED
    PENDING
    IN_PROGRESS
  }

  type TestResult {
    id: ID!
    passed: Boolean!
    details: String
    url: String!
    timestamp: DateTime! @timestamp(operations: [CREATE])
  }

  type Test {
    id: ID! @id
    name: String!
    description: String
    category: TestCategory!
    status: TestStatus!
    createdAt: DateTime! @timestamp(operations: [CREATE])
    updatedAt: DateTime! @timestamp(operations: [UPDATE])
    creator: User @relationship(type: "CREATED", direction: IN)
    requirement: Requirement @relationship(type: "TESTED_BY", direction: OUT)
    results: [TestResult!]! @relationship(type: "TEST_RESULT", direction: OUT)
  }
`;
