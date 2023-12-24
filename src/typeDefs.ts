export const typeDefs = `#graphql
type User {
  id: ID!
  name: String!
  email: String!
  requirements: [Requirement!]! @relationship(type: "HAS_REQUIREMENT", direction: OUT)
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
  updatedAt: DateTime! @timestamp(operations: [UPDATE])
  creator: User @relationship(type: "CREATED", direction: IN)
  parent: Requirement @relationship(type: "CHILD_OF", direction: OUT)
  children: [Requirement!]! @relationship(type: "CHILD_OF", direction: IN)
  tests: [Test] @relationship(type: "TESTED_BY", direction: IN)
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
